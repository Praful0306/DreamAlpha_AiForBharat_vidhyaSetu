import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Load API keys from environment variables
# We check multiple possible variable names to be flexible
primary_key = os.getenv("CHAT_GROQ_API_KEY", "")
fallback_keys_str = os.getenv("CHAT_FALLBACK_GROQ_KEYS", "") or os.getenv("CHATBOT_GROQ_KEYS", "")
fallback_list = [k.strip() for k in fallback_keys_str.split(",") if k.strip()]

# Combine all unique keys, starting with the primary one
ALL_API_KEYS = []
if primary_key:
    ALL_API_KEYS.append(primary_key)
for key in fallback_list:
    if key not in ALL_API_KEYS:
        ALL_API_KEYS.append(key)

# Filter out placeholder values
CHATBOT_API_KEYS = [k for k in ALL_API_KEYS if k and not k.startswith("your_")]

CHATBOT_MODEL = "llama-3.1-8b-instant"

import hashlib

CACHE_FILE = os.path.join(os.path.dirname(__file__), "llm_cache.json")

def _get_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_cache(cache_data):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save cache: {e}")

MOCK_RESPONSES = {
    "en": {
        "answer": "I'm sorry, the Chatbot API Key provided seems to be invalid or experiencing issues. Please check your configurations.",
        "analogy": "Imagine a safe with a broken key. No matter how much you want the knowledge inside, the door won't open until you get the right key!",
        "quiz_question": "What do we need to unlock the AI's brain?",
        "quiz_answer": "A valid API Key!"
    },
    "kn": {
        "answer": "ಕ್ಷಮಿಸಿ, ನೀವು ಒದಗಿಸಿದ Chatbot API ಕೀ ಅಮಾನ್ಯವಾಗಿದೆ ಅಥವಾ ತೊಂದರೆ ಅನುಭವಿಸುತ್ತಿದೆ.",
        "analogy": "ಒಡೆದ ಬೀಗದ ಕೀಯನ್ನು ಹೊಂದಿರುವ ಸೇಫ್ ಅನ್ನು ಊಹಿಸಿ. ಸರಿಯಾದ ಕೀ ಇಲ್ಲದೆ, ನಾವು ಜ್ಞಾನವನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ!",
        "quiz_question": "AI ಮೆದುಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಲು ನಮಗೆ ಏನು ಬೇಕು?",
        "quiz_answer": "ಮಾನ್ಯವಾದ API ಕೀ!"
    },
    "hi": {
        "answer": "क्षमा करें, प्रदान की गई चैटबॉट एपीआई कुंजी अमान्य प्रतीत होती है या समस्याओं का सामना कर रही है।",
        "analogy": "टूटी हुई चाबी वाली तिजोरी की कल्पना करें। आप अंदर का ज्ञान कितना भी चाहें, जब तक आपको सही चाबी नहीं मिल जाती, दरवाजा नहीं खुलेगा!",
        "quiz_question": "हमें AI के दिमाग को अनलॉक करने के लिए क्या चाहिए?",
        "quiz_answer": "एक वैध एपीआई कुंजी!"
    }
}

def ask_gemini(language: str, topic: str, question: str, student_name: str = None, student_age: int = None, student_grade: str = None) -> dict:
    if not CHATBOT_API_KEYS:
        print("⚠️ Warning: No valid Chatbot API keys found in environment variables. Returning mock.")
        lang_key = language if language in MOCK_RESPONSES else "en"
        return MOCK_RESPONSES[lang_key].copy()

    student_context = ""
    if student_name and student_age and student_grade:
        student_context = f"\nYour student's name is {student_name}. They are {student_age} years old and in Class {student_grade}. Speak directly to them using their name."

    age_target = student_age if student_age else 10
    
    # User requested chatbot should always be in English
    lang_instruction = f"Respond in simple English a {age_target}-year-old would understand."

    prompt = f"""You are Vidya-Setu, a friendly AI tutor for rural Indian students.{student_context}

Topic: {topic}
Student question: {question}

Rules:
1. {lang_instruction}
2. CRITICAL: You MUST respond EXCLUSIVELY in pure English. Do NOT use Hindi, Hinglish, or any Indian languages (e.g., do not say "Namaste" or "Mai hai"). 
3. Always start your answer warmly with "Hello, [Student Name]!" and let them know you're here to help them understand the topic clearly.
4. Use a relatable analogy from rural Indian daily life (e.g., farming, cricket, rivers, animals) but explain it entirely in English.
5. Keep the core explanation straightforward and under 3-4 sentences.
6. Create ONE simple quiz question with a clear correct answer.

Reply ONLY with this exact JSON (no extra text before or after):
{{
  "answer": "Warm Hello greeting + short, clear explanation (in pure English)",
  "analogy": "local Indian analogy explained entirely in English, start with Imagine or Think of",
  "quiz_question": "one simple quiz question",
  "quiz_answer": "the correct answer"
}}"""

    # Caching logic
    cache_key = hashlib.md5(prompt.encode("utf-8")).hexdigest()
    cache = _get_cache()
    if cache_key in cache:
        print(f"✅ Using cached response for Doubt Solver (Key: {cache_key})")
        return cache[cache_key]

    last_error = None
    # Iterate through ALL keys until one works
    for idx, api_key in enumerate(CHATBOT_API_KEYS):
        try:
            client = OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1"
            )
            
            response = client.chat.completions.create(
                model=CHATBOT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            raw_text = response.choices[0].message.content.strip()
            
            # Extract JSON robustly
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            parsed_data = None
            if json_match:
                parsed_data = json.loads(json_match.group())
            else:
                parsed_data = json.loads(raw_text)

            if parsed_data:
                print(f"✅ Success using Chatbot API key index {idx}")
                # Save to cache
                cache = _get_cache()
                cache[cache_key] = parsed_data
                _save_cache(cache)
                return parsed_data
            
        except Exception as e:
            msg = str(e)
            shorthand = msg[:50] + "..." if len(msg) > 50 else msg
            print(f"⚠️ Key index {idx} failed: {shorthand}. Trying next...")
            last_error = e
            continue
            
    print(f"❌ All {len(CHATBOT_API_KEYS)} Chatbot API keys failed. Returning mock fallback.")
    lang_key = language if language in MOCK_RESPONSES else "en"
    return MOCK_RESPONSES[lang_key].copy()
