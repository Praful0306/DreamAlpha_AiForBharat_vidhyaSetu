from pydantic import BaseModel
from typing import Optional, List, Dict


class AskRequest(BaseModel):
    """Request model: what the student sends to the backend."""
    language: str
    topic: str
    question: str
    student_name: Optional[str] = None
    student_age: Optional[int] = None
    student_grade: Optional[str] = None


class KnowledgeCardResponse(BaseModel):
    language: str
    topic: str
    question: str
    answer: str
    analogy: str
    quiz_question: str
    quiz_answer: str


class QuizSubmitRequest(BaseModel):
    topic: str
    quiz_question: str
    student_answer: str
    correct_answer: str


class QuizSubmitResponse(BaseModel):
    is_correct: bool
    message: str
    explanation: Optional[str] = None


# ── Phase 6: Adaptive Course Generator Schemas ────────────────────────────────

class CourseGenerateRequest(BaseModel):
    subject: str
    language: str = "en"
    reference_notes: Optional[str] = None
    student_name: Optional[str] = None
    student_age: Optional[int] = None
    student_grade: Optional[str] = None

class ModuleSummary(BaseModel):
    id: int
    title: str
    description: str

class CourseGenerateResponse(BaseModel):
    modules: list[ModuleSummary]

class ModuleContentRequest(BaseModel):
    module_id: int
    subject: str
    title: str
    language: str = "en"
    student_name: Optional[str] = None
    student_age: Optional[int] = None
    student_grade: Optional[str] = None
    failed_attempts: int = 0

class ModuleContentResponse(BaseModel):
    explanation: str
    mermaid_diagram: str
    quiz_question: str
    quiz_answer: str


# ── Phase 7: Full Quiz / Test Schemas ─────────────────────────────────────────

class QuizGenerateRequest(BaseModel):
    module_id: int
    module_title: str
    subject: str
    language: str = "en"
    student_name: Optional[str] = None
    student_age: Optional[int] = None
    student_grade: Optional[str] = None
    previous_questions: Optional[List[str]] = None

class QuizQuestion(BaseModel):
    id: int
    type: str           # "mcq" or "short_answer"
    difficulty: str     # "basic", "intermediate", "advanced"
    question: str
    options: Optional[Dict[str, str]] = None
    correct_answer: str
    explanation: str

class QuizGenerateResponse(BaseModel):
    questions: list[QuizQuestion]

# ── Phase 8: Progress Sync Schemas ───────────────────────────────────────────────

class ProgressData(BaseModel):
    subject: str
    modules: list[ModuleSummary]
    completedModules: list[int]
    testResults: list[dict]
    studentProfile: Optional[dict] = None

class ProgressSaveRequest(BaseModel):
    student_id: str
    data: ProgressData

class ProgressLoadResponse(BaseModel):
    student_id: str
    data: Optional[ProgressData] = None
