import os
import json
import re
import hashlib
import random
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("MODULE_GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"

# Load fallback API keys from environment variable (comma-separated string)
fallback_keys_str = os.getenv("MODULE_FALLBACK_GROQ_KEYS", "")
API_KEYS = [k.strip() for k in fallback_keys_str.split(",") if k.strip()]

# If no fallback keys are provided in .env, just use the primary key
if not API_KEYS and os.getenv("MODULE_GROQ_API_KEY") and os.getenv("MODULE_GROQ_API_KEY") != "your_module_key_here":
    API_KEYS = [os.getenv("MODULE_GROQ_API_KEY")]

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

def _extract_json(text: str) -> dict:
    """Safely extract JSON from LLM responses even if markdown-wrapped."""
    match = re.search(r'\{.*\}|\[.*\]', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    try:
        return json.loads(text)
    except:
        raise ValueError(f"Failed to parse JSON from response: {text[:200]}")

def _execute_with_fallback(messages, temperature=0.3, response_format=None, skip_cache=False):
    prompt_str = json.dumps(messages, sort_keys=True)
    cache_key = hashlib.md5(prompt_str.encode("utf-8")).hexdigest()

    if not skip_cache:
        cache = _get_cache()
        if cache_key in cache:
            print(f"Using cached LLM response (Key: {cache_key})")
            return cache[cache_key]

    last_error = None
    keys_to_try = API_KEYS.copy()
    if GROQ_API_KEY and GROQ_API_KEY not in keys_to_try:
        keys_to_try.insert(0, GROQ_API_KEY)

    for key in keys_to_try:
        try:
            client = OpenAI(api_key=key, base_url="https://api.groq.com/openai/v1")
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=temperature,
                response_format=response_format
            )
            content_str = response.choices[0].message.content
            parsed_json = _extract_json(content_str)

            if not skip_cache:
                cache = _get_cache()
                cache[cache_key] = parsed_json
                _save_cache(cache)

            return parsed_json
        except Exception as e:
            print(f"API call failed with key {key[:8]}... Error: {e}")
            last_error = e
            continue

    raise RuntimeError(f"All LLM API keys failed. Last error: {last_error}")


def generate_course_outline(subject: str, reference_notes: str, language: str, student_name: str, student_age: int, student_grade: str) -> dict:
    """Generates a JSON array of Modules for the requested subject."""
    age_str = str(student_age) if student_age else "10"
    
    language_map = {"en": "English", "kn": "Kannada", "hi": "Hindi"}
    target_language = language_map.get(language, "English")

    prompt = f"""You are Vidya-Setu, an expert adaptive AI tutor.
Student: {student_name} (Age {age_str}, Grade: {student_grade})
Subject to learn: {subject}

Reference Notes: {reference_notes if reference_notes else "None provided. Use standard curriculum concepts."}

CRITICAL INSTRUCTION: You MUST write the 'title' and 'description' fields ENTIRELY in {target_language}. Do not write them in English unless the requested language is English.

Create a structured course with 3 to 5 logical modules to teach this subject perfectly for their age and grade.

Reply ONLY with valid JSON, no markdown:
{{
  "modules": [
    {{
      "id": 1,
      "title": "Module Title",
      "description": "Brief description of what will be covered"
    }}
  ]
}}"""

    return _execute_with_fallback(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"}
    )


def generate_module_content(module_id: int, module_title: str, subject: str, language: str, student_name: str, student_age: int, student_grade: str, failed_attempts: int = 0) -> dict:
    """
    Generates structured, bullet-point lesson content with a simple Mermaid diagram.
    Returns: explanation (rich markdown), mermaid_diagram, quiz_question, quiz_answer
    """
    age_str = str(student_age) if student_age else "10"
    
    language_map = {"en": "English", "kn": "Kannada", "hi": "Hindi"}
    target_language = language_map.get(language, "English")

    difficulty_note = ""
    if failed_attempts > 0:
        difficulty_note = f"""
IMPORTANT: The student failed the quiz {failed_attempts} time(s). Completely restart with a much simpler explanation using a totally different analogy. Be extremely clear."""

    prompt = f"""You are Vidya-Setu, an expert AI tutor for Indian students.
Student: {student_name} (Age {age_str}, Grade: {student_grade})
Course: {subject}
Module {module_id}: {module_title}
{difficulty_note}

CRITICAL INSTRUCTION: You MUST write the 'explanation', 'quiz_question', and 'quiz_answer' fields ENTIRELY in {target_language}.
Do NOT use English for explanations unless {target_language} is English. Only use English for markdown formatting or the explicit JSON keys.

Generate a comprehensive, perfectly structured lesson.

For the 'explanation' field, use this EXACT markdown structure:
## What is {module_title}?
Clear 1-2 sentence definition a student can instantly understand.

## Key Concepts
- **Concept 1**: Clear explanation of the first core idea
- **Concept 2**: Clear explanation of the second core idea
- **Concept 3**: Continue for all major concepts (minimum 4 bullet points)

## How it Works (Step by Step)
1. **Step 1** — Describe the first step clearly
2. **Step 2** — Describe the second step clearly
3. **Step 3** — Continue for all steps

## Real-World Example
Give ONE concrete, relatable example that a rural Indian student would understand (farming, cricket, village life, school). Walk through it in 3–4 sentences.

## Quick Tips to Remember
- Tip 1: A short memorable rule
- Tip 2: A common mistake to avoid
- Tip 3: A trick to remember this better

For the 'mermaid_diagram' field, write ONLY raw valid Mermaid graph TD code.
CRITICAL RULES for mermaid:
- Use ONLY graph TD direction
- Node labels must have NO special characters (no colons, quotes, brackets, parentheses)
- Max 6 nodes total
- Use simple ---> arrows only
- Example: graph TD\n  A[Topic] ---> B[Concept1]\n  A ---> C[Concept2]\n  B ---> D[Detail]

Reply ONLY with valid JSON:
{{
  "explanation": "## What is...\\n\\n## Key Concepts\\n- ...",
  "mermaid_diagram": "graph TD\\n  A[...] ---> B[...]",
  "quiz_question": "A single clear conceptual question about this module",
  "quiz_answer": "The exact correct answer in 1-2 sentences"
}}"""

    return _execute_with_fallback(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        response_format={"type": "json_object"}
    )


def generate_quiz(module_id: int, module_title: str, subject: str, language: str, student_name: str, student_age: int, student_grade: str, previous_questions: list = None) -> dict:
    """
    Generates a full test with 3 questions.
    Difficulty scales based on module_id:
    - Module 1: Baseline is Easy/Basic.
    - Module 2: Baseline is Intermediate.
    - Module 3+: Baseline is Advanced.
    """
    age_str = str(student_age) if student_age else "10"
    
    language_map = {"en": "English", "kn": "Kannada", "hi": "Hindi"}
    target_language = language_map.get(language, "English")
    
    prev_q_text = ""
    if previous_questions:
        prev_q_text = f"\nDo NOT repeat or closely resemble these previously asked questions:\n" + "\n".join(f"- {q}" for q in previous_questions)

    # Calculate difficulty focus based on module index (1-based)
    if module_id == 1:
        diff_focus = "Focus on VERY BASIC and easy concepts. This is the first module, so keep it extremely encouraging and simple."
    elif module_id == 2:
        diff_focus = "Focus on INTERMEDIATE concepts. This is the second module, so slightly increase the depth and application."
    else:
        diff_focus = f"Focus on ADVANCED concepts. This is module {module_id}, so provide deeper challenges and more complex scenarios."

    prompt = f"""You are Vidya-Setu, an expert AI tutor. Generate a test for:
Student: {student_name} (Age {age_str}, Grade: {student_grade})
Subject: {subject}
Topic: {module_title} ONLY (CRITICAL: Do not ask questions from other topics)
Module Sequence: This is Module #{module_id}.
Difficulty Multiplier: {diff_focus}

CRITICAL INSTRUCTION: You MUST write every 'question', all 'options', the 'correct_answer', and the 'explanation' ENTIRELY in {target_language}.
Do NOT use English unless {target_language} is English.

Create EXACTLY 3 neat questions in this order:
1. Basic — a simple conceptual question matching the Difficulty Multiplier.
2. Intermediate — requires understanding and application of the {module_title} concept.
3. Advanced — a coding/programming question OR a deep scenario related to {module_title}.

Rules:
- CRITICAL: EVERY question must be strictly related to "{module_title}".
- MCQ must have exactly 4 options labeled A, B, C, D
- Short-answer questions have no options (set to null)
- type MUST be exactly "mcq" or "short_answer". 
- Each question must have a clear correct_answer and a brief explanation.
- Difficulty MUST scale within the set of 3 questions (basic -> intermediate -> advanced), but the "baseline" is set by the Difficulty Multiplier for this module.

Reply ONLY with valid JSON:
{{
  "questions": [
    {{
      "id": 1,
      "type": "mcq",
      "difficulty": "basic",
      "question": "Question text",
      "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
      "correct_answer": "A",
      "explanation": "Why A is correct..."
    }},
    {{
      "id": 2,
      "type": "short_answer",
      "difficulty": "intermediate",
      "question": "Question text",
      "options": null,
      "correct_answer": "The expected answer",
      "explanation": "Why this is the correct answer..."
    }},
    {{
      "id": 3,
      "type": "short_answer",
      "difficulty": "advanced",
      "question": "Advanced question text",
      "options": null,
      "correct_answer": "The expected answer",
      "explanation": "Explanation..."
    }}
  ]
}}"""

    # Always skip cache for quizzes so questions are fresh
    return _execute_with_fallback(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        response_format={"type": "json_object"},
        skip_cache=True
    )
