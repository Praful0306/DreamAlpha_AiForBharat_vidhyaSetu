import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuiz } from '../services/api';
import type { QuizQuestionData } from '../services/api';

interface TestPageProps {
    moduleId: number;
    moduleTitle: string;
    subject: string;
    studentProfile: { name: string; age: number; grade: string } | null;
    onTestComplete: (moduleId: number, score: number, total: number, questions: QuizQuestionData[]) => void;
    onBack: () => void;
    t: any;
    language: any;
}

const DIFFICULTY_COLOR: Record<string, string> = {
    basic: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444'
};

const DIFFICULTY_LABEL: Record<string, string> = {
    basic: '🟢 Basic',
    intermediate: '🟡 Intermediate',
    advanced: '🔴 Advanced'
};

export function TestPage({ moduleId, moduleTitle, subject, studentProfile, onTestComplete, onBack, t, language }: TestPageProps) {
    const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const previousQuestions: string[] = JSON.parse(
            localStorage.getItem(`vidya_prev_questions_${moduleId}`) || '[]'
        );

        setIsLoading(true);
        generateQuiz({
            module_id: moduleId,
            module_title: moduleTitle,
            subject,
            language,
            student_name: studentProfile?.name,
            student_age: studentProfile?.age,
            student_grade: studentProfile?.grade,
            previous_questions: previousQuestions
        }).then(res => {
            setQuestions(res.questions || []);
            setIsLoading(false);
        }).catch(err => {
            setError(err.message);
            setIsLoading(false);
        });
    }, [moduleId, moduleTitle, subject, studentProfile]);

    const currentQ = questions[currentIndex];
    const totalQuestions = questions.length;
    const isLastQuestion = currentIndex === totalQuestions - 1;
    const isAnswered = currentQ ? answers[currentQ.id] !== undefined : false;

    const handleSelectAnswer = (answer: string) => {
        if (answers[currentQ.id] !== undefined) return;
        setAnswers(prev => ({ ...prev, [currentQ.id]: answer }));
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) setCurrentIndex(i => i + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
    };

    const handleSubmitAll = () => {
        setIsSubmitting(true);
        // Store question texts for next round (to avoid repeating)
        const qTexts = questions.map(q => q.question);
        const prev = JSON.parse(localStorage.getItem(`vidya_prev_questions_${moduleId}`) || '[]');
        localStorage.setItem(`vidya_prev_questions_${moduleId}`, JSON.stringify([...prev, ...qTexts]));

        let score = 0;
        questions.forEach(q => {
            const userAns = (answers[q.id] || '').trim().toLowerCase();
            const correctAns = q.correct_answer.trim().toLowerCase();
            if (q.type === 'mcq') {
                if (userAns === correctAns) score++;
            } else {
                // short answer: check keyword overlap
                const correctWords = correctAns.split(/\s+/);
                const userWords = userAns.split(/\s+/);
                const overlap = correctWords.filter(w => userWords.includes(w));
                if (overlap.length >= Math.max(1, Math.floor(correctWords.length * 0.4))) score++;
            }
        });

        onTestComplete(moduleId, score, totalQuestions, questions);
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(0,240,255,0.2)', borderTopColor: 'var(--cyan)', animation: 'spin 1s linear infinite' }} />
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>Generating Your Test...</h2>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Creating 3 unique questions from basic to advanced</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <p style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: '24px' }}>Failed to generate quiz: {error}</p>
                <button onClick={onBack} style={{ padding: '12px 32px', borderRadius: '8px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 600 }}>← Back to Module</button>
            </div>
        );
    }

    if (!currentQ) return null;

    const answeredCount = Object.keys(answers).length;
    const progressPct = (answeredCount / totalQuestions) * 100;

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '24px', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', padding: '8px 16px', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>← Back to Module</button>
                <div>
                    <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Knowledge Test</h1>
                    <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.875rem' }}>{moduleTitle} • {subject}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Question {currentIndex + 1} of {totalQuestions}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{answeredCount} answered</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--magenta), var(--cyan))', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                </div>
            </div>

            {/* Question Nav Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {questions.map((q, i) => (
                    <button key={q.id} onClick={() => setCurrentIndex(i)} style={{
                        width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                        background: i === currentIndex ? 'linear-gradient(135deg, var(--magenta), var(--cyan))' : answers[q.id] !== undefined ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                        color: i === currentIndex ? '#0f172a' : answers[q.id] !== undefined ? '#22c55e' : '#94a3b8',
                        border: i === currentIndex ? 'none' : answers[q.id] !== undefined ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s'
                    }}>{i + 1}</button>
                ))}
            </div>

            {/* Question Card */}
            <div style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                {/* Difficulty badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: DIFFICULTY_COLOR[currentQ.difficulty] || '#94a3b8', background: `${DIFFICULTY_COLOR[currentQ.difficulty]}15`, padding: '4px 12px', borderRadius: '999px', border: `1px solid ${DIFFICULTY_COLOR[currentQ.difficulty]}40` }}>
                        {DIFFICULTY_LABEL[currentQ.difficulty] || currentQ.difficulty}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {currentQ.type === 'mcq' ? '📋 Multiple Choice' : currentQ.difficulty === 'advanced' ? '💻 Code / Advanced' : '✏️ Short Answer'}
                    </span>
                </div>

                {/* Question Text */}
                <p style={{ color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.6, margin: '0 0 32px 0', whiteSpace: 'pre-wrap' }}>{currentQ.question}</p>

                {/* MCQ Options */}
                {currentQ.type === 'mcq' && currentQ.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(Object.entries(currentQ.options) as [string, string][]).map(([key, val]) => {
                            const userAns = answers[currentQ.id];
                            const isSelected = userAns === key;
                            const isCorrect = isAnswered && key === currentQ.correct_answer;
                            const isWrong = isAnswered && isSelected && key !== currentQ.correct_answer;

                            return (
                                <button key={key} onClick={() => handleSelectAnswer(key)} style={{
                                    width: '100%', textAlign: 'left', padding: '16px 20px', borderRadius: '12px', cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.2s',
                                    background: isCorrect ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : isSelected ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: isCorrect ? '1px solid rgba(34,197,94,0.5)' : isWrong ? '1px solid rgba(239,68,68,0.5)' : isSelected ? '1px solid rgba(0,240,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex', alignItems: 'center', gap: '16px'
                                }}>
                                    <span style={{
                                        width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                                        background: isCorrect ? 'rgba(34,197,94,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                                        color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : '#94a3b8'
                                    }}>{key}</span>
                                    <span style={{ color: isCorrect ? '#22c55e' : isWrong ? '#f87171' : '#e2e8f0', fontSize: '1rem' }}>{val}</span>
                                    {isCorrect && <span style={{ marginLeft: 'auto', color: '#22c55e', fontSize: '1.25rem' }}>✓</span>}
                                    {isWrong && <span style={{ marginLeft: 'auto', color: '#ef4444', fontSize: '1.25rem' }}>✗</span>}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Short Answer / Code Area */}
                {currentQ.type !== 'mcq' && (
                    <textarea
                        value={isAnswered ? answers[currentQ.id] : (draftAnswers[currentQ.id] || '')}
                        onChange={e => !isAnswered && setDraftAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                        onKeyDown={e => {
                            if (!isAnswered && e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const val = draftAnswers[currentQ.id]?.trim();
                                if (val) handleSelectAnswer(val);
                            }
                        }}
                        readOnly={isAnswered}
                        placeholder={isAnswered ? "" : "Type your answer here... (Shift + Enter for new line, Enter to submit)"}
                        rows={6}
                        style={{
                            width: '100%', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                            color: '#f1f5f9', padding: '16px 20px', fontSize: '1rem', outline: 'none', resize: 'vertical',
                            fontFamily: currentQ.difficulty === 'advanced' ? 'monospace' : 'inherit', lineHeight: 1.6, boxSizing: 'border-box',
                            opacity: isAnswered ? 0.8 : 1
                        }}
                        onFocus={e => { if (!isAnswered) e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                        onBlur={e => { if (!isAnswered) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                )}

                {/* Show explanation after answering */}
                {isAnswered && (
                    <div style={{ marginTop: '24px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>💡 Explanation</p>
                        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{currentQ.explanation}</p>
                        {currentQ.type !== 'mcq' && (
                            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Answer</p>
                                <p style={{ color: '#22c55e', margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{currentQ.correct_answer}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* For short answer / code: save button */}
                {currentQ.type !== 'mcq' && !isAnswered && (
                    <button
                        onClick={() => { const val = draftAnswers[currentQ.id]?.trim(); if (val) handleSelectAnswer(val); }}
                        style={{ marginTop: '16px', padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(90deg, var(--magenta), var(--cyan))', border: 'none', color: '#0f172a', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                        Send Answer (Enter)
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '16px' }}>
                <button onClick={handlePrev} disabled={currentIndex === 0} style={{
                    padding: '14px 28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
                    color: currentIndex === 0 ? '#334155' : '#94a3b8', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem'
                }}>← Previous</button>

                {isLastQuestion ? (
                    <button onClick={handleSubmitAll} disabled={answeredCount < totalQuestions || isSubmitting} style={{
                        padding: '14px 40px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: answeredCount < totalQuestions ? 'not-allowed' : 'pointer',
                        background: answeredCount >= totalQuestions ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.05)',
                        color: answeredCount >= totalQuestions ? 'white' : '#334155',
                        boxShadow: answeredCount >= totalQuestions ? '0 4px 20px rgba(34,197,94,0.3)' : 'none', transition: 'all 0.3s'
                    }}>
                        {isSubmitting ? 'Checking...' : answeredCount < totalQuestions ? `Answer all questions (${answeredCount}/${totalQuestions})` : '🎯 Submit Test & See Results'}
                    </button>
                ) : (
                    <button onClick={handleNext} style={{
                        padding: '14px 28px', borderRadius: '12px', background: 'linear-gradient(90deg, var(--magenta), var(--cyan))',
                        border: 'none', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
                    }}>Next →</button>
                )}
            </div>
        </div>
    );
}
