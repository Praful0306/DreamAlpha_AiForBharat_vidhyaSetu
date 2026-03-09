import boto3
import json
import os
import time
from typing import List, Dict, Optional
from botocore.exceptions import ClientError
from app.dynamo_client import check_rate_limit
from dotenv import load_dotenv

# Force override to use .env values
load_dotenv(override=True)

# AWS Configuration for Chat
AWS_REGION = os.getenv("MY_AWS_REGION", os.getenv("AWS_REGION", "us-east-1"))
CHAT_AWS_ACCESS_KEY_ID = os.getenv("CHAT_AWS_ACCESS_KEY_ID") or os.getenv("MY_AWS_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY_ID")
CHAT_AWS_SECRET_ACCESS_KEY = os.getenv("CHAT_AWS_SECRET_ACCESS_KEY") or os.getenv("MY_AWS_SECRET_ACCESS_KEY") or os.getenv("AWS_SECRET_ACCESS_KEY")

# Explicitly handle session token isolation
try:
    with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), "r", encoding="utf-8") as f:
        env_content = f.read()
        if "CHAT_AWS_SESSION_TOKEN" not in env_content or "your_chat_session_token_optional" in env_content:
            CHAT_AWS_SESSION_TOKEN = None
        else:
            CHAT_AWS_SESSION_TOKEN = os.getenv("CHAT_AWS_SESSION_TOKEN")
except FileNotFoundError:
    CHAT_AWS_SESSION_TOKEN = None  # On Lambda, no .env file — use IAM role instead

# Model ID - using Mistral 7B Instruct for Chat/Doubts
BEDROCK_MODEL_ID = "mistral.mistral-7b-instruct-v0:2"

# Rate Limiting is now handled in app/dynamo_client.py

def ask_bedrock_doubt_solver(language: str, topic: str, question: str, student_name: str = None, student_age: int = None, student_grade: str = None) -> dict:
    """
    Calls Bedrock Llama 3.1 70B for structured doubt solving (Knowledge Card style).
    Returns a dict with: answer, analogy, quiz_question, quiz_answer.
    """
    # Enforcement: Rate Limiting (DynamoDB)
    # This prevents 'leaking' tokens if a user spams the chat button.
    if not check_rate_limit("global", "chat"):
        print(f"Bedrock Chat: Throttling request for cost efficiency...")
        time.sleep(3) # Short wait for chat
        if not check_rate_limit("global", "chat"):
            return {
                "answer": "I'm thinking! Please wait a few seconds before asking another doubt so I can give you my best answer.",
                "analogy": "Like a busy teacher helping another student.",
                "quiz_question": "Is it good to be patient?",
                "quiz_answer": "Yes"
            }

    student_context = ""
    if student_name and student_age and student_grade:
        student_context = f"\nYour student's name is {student_name}. They are {student_age} years old and in Grade {student_grade}. Speak directly to them."

    age_target = student_age if student_age else 10
    
    # Prompt for structured Knowledge Card
    system_prompt = f"""You are Vidya-Setu, a brilliant and friendly AI tutor for rural Indian students.{student_context}

Rules:
1. Respond in simple, clear English that a {age_target}-year-old would understand.
2. YOU MUST RESPOND EXCLUSIVELY IN PURE ENGLISH. No Hindi, Hinglish, or regional terms.
3. Start the answer warmly with "Hello, [Student Name]!" and briefly explain the topic.
4. Use a relatable analogy from rural Indian life (farming, village markets, nature, etc.).
5. Keep the core explanation straightforward and under 3-4 sentences.
6. Create ONE simple quiz question based on your explanation.

CRITICAL: YOU MUST REPLY ONLY WITH A VALID JSON OBJECT. NO PREAMBLE. NO EXPLANATION BEFORE THE JSON.
Return this exact JSON structure:
{{
  "answer": "Warm greeting + simple explanation",
  "analogy": "Imagine... (relatable Indian analogy)",
  "quiz_question": "Short question",
  "quiz_answer": "Correct answer"
}}"""

    # Build Mistral-style prompt
    prompt = f"<s>[INST] {system_prompt}\n\nTopic: {topic}\nQuestion: {question} [/INST] {{"

    try:
        session = boto3.Session(
            aws_access_key_id=CHAT_AWS_ACCESS_KEY_ID,
            aws_secret_access_key=CHAT_AWS_SECRET_ACCESS_KEY,
            aws_session_token=CHAT_AWS_SESSION_TOKEN,
            region_name=AWS_REGION
        )
        client = session.client("bedrock-runtime")
        
        request_body = {
            "prompt": prompt,
            "max_tokens": 1024,
            "temperature": 0.1,
            "top_p": 0.9,
        }

        print(f"Bedrock Doubt Solver: Invoking Mistral Mixtral 8x7B...")
        response = client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body)
        )
        
        response_data = json.loads(response.get("body").read())
        # Mistral output is usually in 'outputs[0].text'
        generation = ""
        if "outputs" in response_data:
            generation = response_data["outputs"][0]["text"].strip()
        else:
            generation = response_data.get("generation", "").strip()
        
        # Prepend the { we forced in the prompt if it's missing (though llama usually continues from it)
        full_text = "{" + generation if not generation.startswith("{") else generation
        
        # Robustly parse JSON
        try:
            import re
            # Extract first valid JSON object
            json_match = re.search(r'(\{.*\})', full_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            return json.loads(full_text)
        except Exception as json_err:
            print(f"JSON Parse Error: {json_err} | Text: {full_text[:100]}...")
            # Better fallback
            return {
                "answer": "Hello! I am here to help. I had a small technical glitch while formatting my explanation, but I'm still learning!",
                "analogy": "Like a new tractor that needs a quick adjustment before it runs perfectly.",
                "quiz_question": "Is Vidya-Setu working hard to improve?",
                "quiz_answer": "Yes"
            }

    except Exception as e:
        print(f"Bedrock Doubt Solver Error: {e}")
        raise RuntimeError(f"Amazon Bedrock chat failed: {e}")
