// QuestionInput.tsx
// Text input where students type their question and press "Ask"

import React, { useState } from "react";

interface QuestionInputProps {
    onAsk: (question: string) => void;
    isLoading: boolean;
    language: string;
    disabled: boolean;
}

export function QuestionInput({ onAsk, isLoading, language, disabled }: QuestionInputProps) {
    const [question, setQuestion] = useState("");

    const placeholder =
        language === "kn"
            ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ... (ಉದಾ: ಗುರುತ್ವಾಕರ್ಷಣೆ ಎಂದರೇನು?)"
            : "Type your question here... (e.g. What is gravity?)";

    const buttonLabel =
        language === "kn"
            ? isLoading ? "ಕಾಯ್ರಿ..." : "ಕೇಳಿ 🎓"
            : isLoading ? "Thinking..." : "Ask 🎓";

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = question.trim();
        if (trimmed && !isLoading && !disabled) {
            onAsk(trimmed);
            setQuestion("");
        }
    }

    return (
        <form className="question-form" onSubmit={handleSubmit}>
            <textarea
                className="question-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading || disabled}
                rows={2}
                maxLength={500}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as unknown as React.FormEvent);
                    }
                }}
            />
            <button
                type="submit"
                className={`ask-btn ${isLoading ? "loading" : ""}`}
                disabled={!question.trim() || isLoading || disabled}
            >
                {isLoading ? (
                    <>
                        <span className="spinner" /> {buttonLabel}
                    </>
                ) : (
                    buttonLabel
                )}
            </button>
        </form>
    );
}
