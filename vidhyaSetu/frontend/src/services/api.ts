// api.ts
// Service layer that calls the Vidya-Setu backend API
// All backend calls go through this file

// Fix for Windows browser IPv6 localhost resolution mismatch:
const BACKEND_URL = (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000").replace("localhost", "127.0.0.1");

// Types that match the backend schemas
export interface AskRequest {
  language: string;  // "en" or "kn"
  topic: string;     // e.g. "Physics - Gravity"
  question: string;  // The student's question
  student_name?: string;
  student_age?: number;
  student_grade?: string;
}

export interface KnowledgeCard {
  language: string;
  topic: string;
  question: string;
  answer: string;       // Main explanation
  analogy: string;      // Local Indian analogy
  quiz_question: string; // Quiz question
  quiz_answer: string;  // Correct answer
}

export interface QuizResult {
  is_correct: boolean;
  message: string;
  explanation: string;
}

/**
 * Send a question to the backend and receive a Knowledge Card.
 */
export async function askQuestion(req: AskRequest): Promise<KnowledgeCard> {
  const response = await fetch(`${BACKEND_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Submit the student's quiz answer and check if it is correct.
 */
export async function submitQuizAnswer(
  topic: string,
  quiz_question: string,
  student_answer: string,
  correct_answer: string
): Promise<QuizResult> {
  const response = await fetch(`${BACKEND_URL}/api/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, quiz_question, student_answer, correct_answer }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
}

// ── Phase 8: Progress Sync ───────────────────────────────────────────────────

export interface ProgressData {
  subject: string;
  modules: ModuleSummary[];
  completedModules: number[];
  testResults: any[];
  studentProfile: { name: string; age: number; grade: string } | null;
}

export async function saveProgress(studentId: string, data: ProgressData): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/progress/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: studentId, data }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save progress: ${response.status}`);
  }
}

export async function loadProgress(studentId: string): Promise<ProgressData | null> {
  const response = await fetch(`${BACKEND_URL}/api/progress/${studentId}`);

  if (!response.ok) {
    throw new Error(`Failed to load progress: ${response.status}`);
  }

  const result = await response.json();
  return result.data || null;
}

// ── Phase 6: Adaptive Course Generation ──────────────────────────────────────

export interface ModuleSummary {
  id: number;
  title: string;
  description: string;
}

export interface CourseGenerateRequest {
  subject: string;
  language?: string;
  reference_notes?: string;
  student_name?: string;
  student_age?: number;
  student_grade?: string;
}

export interface CourseGenerateResponse {
  modules: ModuleSummary[];
}

export interface ModuleContentRequest {
  module_id: number;
  title: string;
  subject: string;
  language?: string;
  student_name?: string;
  student_age?: number;
  student_grade?: string;
  failed_attempts: number;
}

export interface ModuleContentResponse {
  explanation: string;
  mermaid_diagram: string;
  quiz_question: string;
  quiz_answer: string;
}

export async function submitQuiz(req: { topic: string; quiz_question: string; student_answer: string; correct_answer: string; }): Promise<QuizResult> {
  const response = await fetch(`${BACKEND_URL}/api/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export async function generateCourse(req: CourseGenerateRequest): Promise<CourseGenerateResponse> {
  const response = await fetch(`${BACKEND_URL}/api/course/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }
  return response.json();
}

export async function generateModuleContent(req: ModuleContentRequest): Promise<ModuleContentResponse> {
  const response = await fetch(`${BACKEND_URL}/api/module/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }
  return response.json();
}

// ── Phase 7: Full Quiz / Test ─────────────────────────────────────────────────

export interface QuizQuestionData {
  id: number;
  type: 'mcq' | 'short_answer';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  question: string;
  options?: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
}

export interface GenerateQuizRequest {
  module_id: number;
  module_title: string;
  subject: string;
  language?: string;
  student_name?: string;
  student_age?: number;
  student_grade?: string;
  previous_questions?: string[];
}

export interface GenerateQuizResponse {
  questions: QuizQuestionData[];
}

export async function generateQuiz(req: GenerateQuizRequest): Promise<GenerateQuizResponse> {
  const response = await fetch(`${BACKEND_URL}/api/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }
  return response.json();
}
