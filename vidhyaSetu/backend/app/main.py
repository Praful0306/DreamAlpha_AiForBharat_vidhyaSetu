"""
main.py
=======
Main FastAPI backend application for Vidya-Setu.

Endpoints:
  GET  /api/health       → Health check
  POST /api/ask          → Student asks a question, gets a Knowledge Card back
  POST /api/quiz/submit  → Student submits quiz answer, gets correct/incorrect

To run locally:
  uv sync --dev
  copy .env.example .env   (then edit your AWS keys)
  uv run uvicorn app.main:app --reload --port 8000
"""

import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

from mangum import Mangum
from app.schemas import (
    AskRequest,
    KnowledgeCardResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    CourseGenerateRequest,
    CourseGenerateResponse,
    ModuleContentRequest,
    ModuleContentResponse,
    QuizGenerateRequest,
    QuizGenerateResponse,
    ProgressSaveRequest,
    ProgressLoadResponse,
)
from app.gemini_client import ask_gemini
from app.groq_client import generate_course_outline, generate_module_content, generate_quiz
from app.bedrock_client import generate_module_content_bedrock
from app.bedrock_chat_client import ask_bedrock_doubt_solver
from app.bhashini_client import translate_text
from app.dynamo_client import save_student_progress, load_student_progress

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Create FastAPI app ────────────────────────────────────────────────────────
app = FastAPI(
    title="Vidya-Setu API",
    description="Backend for Vidya-Setu – AI tutor for rural Indian students.",
    version="1.0.0",
)

# ── AWS Lambda Handler ───────────────────────────────────────────────────────
# Mangum allows FastAPI to run on AWS Lambda + API Gateway.
handler = Mangum(app)

@app.get("/")
async def root():
    return {"message": "Welcome to the Vidya-Setu API Knowledge Engine!", "status": "active"}

# ── Allow the React frontend to call this backend ─────────────────────────────
# CORS = Cross-Origin Resource Sharing. Without this, the browser will block
# the frontend from talking to the backend.
# NOTE: Starlette's CORSMiddleware does NOT support wildcard patterns in
# allow_origins (e.g. "https://*.vercel.app" won't work). Use allow_origin_regex.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://main.d2xlz7oxt7z5q.amplifyapp.com", # Example Amplify URL (will update)
    ],
    allow_origin_regex=r"https://.*\.amplifyapp\.com", # Match any AWS Amplify deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints (Phase 1-5 Q&A) ─────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Simple endpoint to confirm the backend is running."""
    return {"status": "ok", "message": "Vidya-Setu backend is running! 🎓"}


# ── Code Execution Proxy (JDoodle) ────────────────────────────────────────────
# Browser cannot call JDoodle directly (CORS blocked).
# This endpoint proxies the request server-side.

JDOODLE_CLIENT_ID     = "70d435ad3e113d16f669c846d165b63e"
JDOODLE_CLIENT_SECRET = "f8e41ae6a2681285afbcab4341ee0cfe6703091ed4622caa6a1c8ba078ede51e"

class ExecuteRequest(BaseModel):
    script: str
    language: str
    versionIndex: str = "0"

class ExecuteResponse(BaseModel):
    output: str
    statusCode: int
    memory: str = ""
    cpuTime: str = ""

@app.post("/api/execute", response_model=ExecuteResponse)
async def execute_code(req: ExecuteRequest):
    """
    Proxy code execution to JDoodle API server-side.
    Browser cannot call JDoodle directly due to CORS — this fixes that.
    """
    if not req.script.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")

    payload = {
        "clientId":     JDOODLE_CLIENT_ID,
        "clientSecret": JDOODLE_CLIENT_SECRET,
        "script":       req.script,
        "language":     req.language,
        "versionIndex": req.versionIndex,
        "stdin":        "",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.jdoodle.com/v1/execute",
                json=payload,
                headers={"Content-Type": "application/json"},
            )
        data = resp.json()
        return ExecuteResponse(
            output=data.get("output", "").strip(),
            statusCode=data.get("statusCode", 200),
            memory=str(data.get("memory", "")),
            cpuTime=str(data.get("cpuTime", "")),
        )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Execution timed out. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")


@app.post("/api/ask", response_model=KnowledgeCardResponse)
async def ask_question(request: AskRequest):
    """
    Student asks a question about a school topic.

    Steps:
    1. (Optional) Translate question from regional language → English via Bhashini.
    2. Send English question to Amazon Bedrock (Claude 3.5).
    3. Get back: explanation + analogy + quiz question.
    4. (Optional) Translate response back to regional language via Bhashini.
    5. Return structured Knowledge Card to the frontend.
    """

    # Basic validation
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if len(request.question) > 500:
        raise HTTPException(status_code=400, detail="Question is too long (max 500 chars).")

    # Step 1: Translate input to English (if needed and Bhashini is available)
    question_in_english = request.question
    if request.language != "en":
        question_in_english = await translate_text(
            text=request.question,
            source_lang=request.language,
            target_lang="en"
        )

    # Step 2 & 3: Call Bedrock first, fallback to Groq if AWS credentials fail
    try:
        card_data = ask_bedrock_doubt_solver(
            language=request.language,
            topic=request.topic,
            question=question_in_english,
            student_name=request.student_name,
            student_age=request.student_age,
            student_grade=request.student_grade
        )
    except Exception as bedrock_err:
        print(f"Bedrock Chat failed, falling back to Groq: {bedrock_err}")
        try:
            card_data = ask_gemini(
                language=request.language,
                topic=request.topic,
                question=question_in_english,
                student_name=request.student_name,
                student_age=request.student_age,
                student_grade=request.student_grade
            )
        except Exception as groq_err:
            raise HTTPException(status_code=500, detail=f"Both AI engines failed. {groq_err}")

    # Step 4: (Optional) If Bhashini translated the input, the response
    # is already in the target language from the prompt. No re-translation needed
    # when using Claude's multilingual output. Only translate if Bhashini round-trip
    # is desired in a future enhancement.

    # Step 5: Build and return the Knowledge Card
    return KnowledgeCardResponse(
        language=request.language,
        topic=request.topic,
        question=request.question,
        answer=card_data.get("answer", ""),
        analogy=card_data.get("analogy", ""),
        quiz_question=card_data.get("quiz_question", ""),
        quiz_answer=card_data.get("quiz_answer", ""),
    )


@app.post("/api/quiz/submit", response_model=QuizSubmitResponse)
async def submit_quiz(request: QuizSubmitRequest):
    """
    Student submits their answer to the quiz question.
    Simple string-match check for now.
    """
    student = request.student_answer.strip().lower()
    correct = request.correct_answer.strip().lower()

    # Check if key words from the correct answer appear in student's answer
    correct_words = set(correct.split())
    student_words = set(student.split())
    overlap = correct_words & student_words
    is_correct = len(overlap) >= max(1, len(correct_words) // 2)

    if is_correct:
        return QuizSubmitResponse(
            is_correct=True,
            message="✅ Correct! Great job!",
            explanation=f"The correct answer is: {request.correct_answer}"
        )
    else:
        return QuizSubmitResponse(
            is_correct=False,
            message="❌ Not quite. Try again!",
            explanation=f"The correct answer is: {request.correct_answer}"
        )


# ── Endpoints (Phase 6 Adaptive Courses - via Groq) ───────────────────────────

@app.post("/api/course/generate", response_model=CourseGenerateResponse)
async def api_generate_course(req: CourseGenerateRequest):
    """
    Builds a custom 3-5 module syllabus outlining a personalized course.
    """
    try:
        outline_data = generate_course_outline(
            subject=req.subject,
            reference_notes=req.reference_notes,
            language=req.language,
            student_name=req.student_name,
            student_age=req.student_age,
            student_grade=req.student_grade
        )
        return CourseGenerateResponse(modules=outline_data.get("modules", []))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/module/content", response_model=ModuleContentResponse)
async def api_generate_module(req: ModuleContentRequest):
    """
    Teaches a specific module with Step-by-Step explanation, a visual Mermaid diagram, and a Quiz.
    If failed_attempts > 0, it dynamically adapts the explanation to be simpler.
    """
    # Try Bedrock (Llama 3.1 70B) first — fallback to Groq if unavailable
    try:
        content_data = generate_module_content_bedrock(
            module_id=req.module_id,
            module_title=req.title,
            subject=req.subject,
            language=req.language,
            student_name=req.student_name,
            student_age=req.student_age,
            student_grade=req.student_grade,
            failed_attempts=req.failed_attempts
        )
    except Exception as bedrock_err:
        print(f"Bedrock failed for module {req.module_id}, falling back to Groq: {bedrock_err}")
        try:
            content_data = generate_module_content(
                module_id=req.module_id,
                module_title=req.title,
                subject=req.subject,
                language=req.language,
                student_name=req.student_name,
                student_age=req.student_age,
                student_grade=req.student_grade,
                failed_attempts=req.failed_attempts
            )
        except Exception as groq_err:
            raise HTTPException(status_code=500, detail=f"Both Bedrock and Groq failed. Groq error: {groq_err}")

    return ModuleContentResponse(
        explanation=content_data.get("explanation", "Failed to generate explanation. Please refresh."),
        mermaid_diagram=content_data.get("mermaid_diagram", ""),
        quiz_question=content_data.get("quiz_question", "No quiz available."),
        quiz_answer=content_data.get("quiz_answer", "")
    )


@app.post("/api/quiz/generate", response_model=QuizGenerateResponse)
async def api_generate_quiz(req: QuizGenerateRequest):
    """
    Generates a full test with 6 questions: basic → intermediate → advanced.
    Accepts a list of previous_questions to avoid repeating the same questions.
    """
    try:
        quiz_data = generate_quiz(
            module_id=req.module_id,
            module_title=req.module_title,
            subject=req.subject,
            language=req.language,
            student_name=req.student_name,
            student_age=req.student_age,
            student_grade=req.student_grade,
            previous_questions=req.previous_questions or []
        )
        return QuizGenerateResponse(questions=quiz_data.get("questions", []))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Phase 8: Progress Sync ──────────────────────────────────────────────────

@app.post("/api/progress/save")
async def save_progress(request: ProgressSaveRequest):
    """
    Save student's progress to DynamoDB.
    """
    save_student_progress(request.student_id, request.data.dict())
    return {"status": "success", "message": "Progress saved successfully."}

@app.get("/api/progress/{student_id}", response_model=ProgressLoadResponse)
async def load_progress(student_id: str):
    """
    Load student's progress from DynamoDB.
    """
    data_dict = load_student_progress(student_id)
    if not data_dict:
        # Return empty shell if no data exists instead of 404
        return ProgressLoadResponse(student_id=student_id, data=None)
    
    return ProgressLoadResponse(student_id=student_id, data=data_dict)
