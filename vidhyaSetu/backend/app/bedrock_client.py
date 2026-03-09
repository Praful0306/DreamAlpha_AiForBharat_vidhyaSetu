import os
import json
import re
import time
import boto3
from app.dynamo_client import check_rate_limit, get_bedrock_cache, save_bedrock_cache
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Force override to use .env values
load_dotenv(override=True)

# AWS Configuration — accept both MY_AWS_* (custom) and standard AWS_* names
AWS_REGION = os.getenv("MY_AWS_REGION", os.getenv("AWS_REGION", "us-east-1"))
AWS_ACCESS_KEY_ID = os.getenv("MY_AWS_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("MY_AWS_SECRET_ACCESS_KEY") or os.getenv("AWS_SECRET_ACCESS_KEY")

# CRITICAL: If AWS_SESSION_TOKEN is in the system context but NOT in our .env,
# os.getenv will still find it. We must ensure it's only used if explicitly provided in .env.
try:
    with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), "r", encoding="utf-8") as f:
        env_content = f.read()
        if "AWS_SESSION_TOKEN" not in env_content:
            AWS_SESSION_TOKEN = None
        else:
            AWS_SESSION_TOKEN = os.getenv("AWS_SESSION_TOKEN")
except FileNotFoundError:
    AWS_SESSION_TOKEN = None  # On Lambda, no .env file — use IAM role instead

BEDROCK_MODEL_ID = "meta.llama3-1-70b-instruct-v1:0"

# Rate Limiting Configuration is now handled in app/dynamo_client.py

def _extract_json(text: str) -> dict:
    """Safely extract JSON from Llama 3.1 responses."""
    match = re.search(r'\{.*\}|\[.*\]', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    try:
        return json.loads(text)
    except:
        raise ValueError(f"Bedrock: Failed to parse JSON from response: {text[:200]}")

def generate_module_content_bedrock(module_id: int, module_title: str, subject: str, language: str, student_name: str, student_age: int, student_grade: str, failed_attempts: int = 0) -> dict:
    """
    Teaches a specific module using Llama 3.1 70B via Amazon Bedrock.
    Includes rate limiting and caching for cost saving.
    """
    # Check Cache First (DynamoDB)
    cache_key = f"mod_{module_id}_{module_title}_{subject}_{student_grade}_{failed_attempts}_{language}"
    cached_content = get_bedrock_cache(cache_key)
    if cached_content:
         print(f"Bedrock: Using cached module content (Topic: {module_title})")
         return cached_content

    # Enforcement: Rate Limiting (DynamoDB)
    # We use a shared 'bedrock_llama' key to throttle expensive calls globally
    if not check_rate_limit("global", "module"):
        print(f"Bedrock: Throttling request for cost efficiency...")
        # In a real app we might raise an error, for now we just sleep and retry once
        time.sleep(10)
        if not check_rate_limit("global", "module"):
            raise RuntimeError("Bedrock is currently throttled due to high usage. Please try again in a minute.")

    age_str = str(student_age) if student_age else "10"
    
    language_map = {"en": "English", "kn": "Kannada", "hi": "Hindi"}
    target_language = language_map.get(language, "English")

    difficulty_note = ""
    if failed_attempts > 0:
        difficulty_note = f"\nIMPORTANT: The student failed the quiz {failed_attempts} time(s). Simplify the explanation immensely using simpler analogies."

    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are Vidya-Setu, an expert adaptive AI tutor for Indian students.
Generate a structured learning module. Reply ONLY with valid JSON.

CRITICAL INSTRUCTION: You MUST write the 'explanation', 'quiz_question', and 'quiz_answer' fields ENTIRELY in {target_language}.
Do NOT use English for explanations unless {target_language} is English. Only use English for markdown formatting or the explicit JSON keys.

Markdown structure for 'explanation':
## What is [Topic]?
## Key Concepts
- **Concept**: Description
## How it Works
1. **Step**
## Real-World Example (Rural India focus)
## Quick Tips<|eot_id|><|start_header_id|>user<|end_header_id|>
Student: {student_name} (Age {age_str}, Grade {student_grade})
Course: {subject}
Module {module_id}: {module_title}
{difficulty_note}

Generate JSON:
{{
  "explanation": "Markdown text...",
  "mermaid_diagram": "graph TD\\n...",
  "quiz_question": "...",
  "quiz_answer": "..."
}}
- Use ONLY graph TD direction
- Node labels must be plain text (NO colons, NO quotes, NO brackets, NO parentheses, NO special characters like | or >)
- Use ONLY simple ---> arrows
- Keep it extremely simple with max 6 nodes total
- Example format: StartNode ---> EndNode<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    try:
        # Use an explicit Session to isolate credentials from the system environment
        session = boto3.Session(
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            aws_session_token=AWS_SESSION_TOKEN, # Will be None if not in .env
            region_name=AWS_REGION
        )
        client = session.client("bedrock-runtime")
        
        request_body = {
            "prompt": prompt,
            "max_gen_len": 2048,
            "temperature": 0.3,
            "top_p": 0.9,
        }

        print(f"Bedrock: Invoking Llama 3.1 70B (Module {module_id})")
        response = client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body)
        )

        # Read and parse the response body from Bedrock
        response_data = json.loads(response["body"].read())
        # Llama 3.1 returns text in 'generation' key
        content = response_data.get("generation", "").strip()
        if not content:
            raise ValueError(f"Bedrock returned empty generation for Module {module_id}")

        parsed_json = _extract_json(content)

        # Save to Cache (DynamoDB)
        save_bedrock_cache(cache_key, parsed_json)

        return parsed_json

    except ClientError as e:
        print(f"Bedrock API Error: {e}")
        raise RuntimeError(f"Amazon Bedrock failed: {e}")
    except Exception as e:
        print(f"Bedrock Unexpected Error: {e}")
        raise e
