// KnowledgeCard.tsx
// Shows the AI-generated teaching card with explanation, analogy, and quiz.

import React, { useState } from "react";
import type { KnowledgeCard as KnowledgeCardType } from "../services/api";
import { submitQuizAnswer } from "../services/api";

interface KnowledgeCardProps {
    card: KnowledgeCardType;
    isSaved?: boolean;
}

export function KnowledgeCard({ card, isSaved }: KnowledgeCardProps) {
    const [quizAnswer, setQuizAnswer] = useState("");
    const [quizResult, setQuizResult] = useState<{ is_correct: boolean; message: string; explanation: string } | null>(null);
    const [isCheckingQuiz, setIsCheckingQuiz] = useState(false);

    const isKannada = card.language === "kn";

    async function handleQuizSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!quizAnswer.trim()) return;

        setIsCheckingQuiz(true);
        try {
            const result = await submitQuizAnswer(
                card.topic,
                card.quiz_question,
                quizAnswer,
                card.quiz_answer
            );
            setQuizResult(result);
        } catch {
            setQuizResult({
                is_correct: false,
                message: "Could not check answer. Try again.",
                explanation: card.quiz_answer,
            });
        } finally {
            setIsCheckingQuiz(false);
        }
    }

    return (
        <div className="knowledge-card">
            {/* Card Header */}
            <div className="card-header">
                <span className="card-topic">{card.topic}</span>
                {isSaved && <span className="saved-badge">💾 Saved</span>}
            </div>

            {/* Student's Question */}
            <div className="card-question">
                <span className="question-icon">❓</span>
                <p className="question-text">{card.question}</p>
            </div>

            {/* AI Explanation */}
            <div className="card-section answer-section">
                <h3 className="section-title">
                    📖 {isKannada ? "ವಿವರಣೆ" : "Explanation"}
                </h3>
                <p className="answer-text">{card.answer}</p>
            </div>

            {/* Local Analogy */}
            <div className="card-section analogy-section">
                <h3 className="section-title">
                    🌾 {isKannada ? "ಸ್ಥಳೀಯ ಉದಾಹರಣೆ" : "Local Example"}
                </h3>
                <p className="analogy-text">{card.analogy}</p>
            </div>

            {/* Quiz Section */}
            <div className="card-section quiz-section">
                <h3 className="section-title">
                    🧠 {isKannada ? "ಪರೀಕ್ಷಿಸಿ ನೋಡಿ!" : "Test Yourself!"}
                </h3>
                <p className="quiz-question">{card.quiz_question}</p>

                {!quizResult ? (
                    <form className="quiz-form" onSubmit={handleQuizSubmit}>
                        <input
                            className="quiz-input"
                            type="text"
                            placeholder={isKannada ? "ನಿಮ್ಮ ಉತ್ತರ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..." : "Type your answer here..."}
                            value={quizAnswer}
                            onChange={(e) => setQuizAnswer(e.target.value)}
                            disabled={isCheckingQuiz}
                        />
                        <button
                            type="submit"
                            className="quiz-submit-btn"
                            disabled={!quizAnswer.trim() || isCheckingQuiz}
                        >
                            {isCheckingQuiz
                                ? "..."
                                : isKannada ? "ಪರಿಶೀಲಿಸಿ" : "Check Answer"}
                        </button>
                    </form>
                ) : (
                    <div className={`quiz-result ${quizResult.is_correct ? "correct" : "incorrect"}`}>
                        <p className="quiz-result-message">{quizResult.message}</p>
                        <p className="quiz-result-explanation">{quizResult.explanation}</p>
                        <button
                            className="quiz-retry-btn"
                            onClick={() => { setQuizResult(null); setQuizAnswer(""); }}
                        >
                            {isKannada ? "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" : "Try Again"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
