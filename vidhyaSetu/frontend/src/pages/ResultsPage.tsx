import { useNavigate } from 'react-router-dom';
import type { QuizQuestionData } from '../services/api';

interface ResultsPageProps {
    moduleId: number;
    moduleTitle: string;
    score: number;
    total: number;
    questions: QuizQuestionData[];
    studentName: string;
    onRetryTest: () => void;
    onNextModule: () => void;
    onBack: () => void;
    t?: any;
    language?: any;
}

export function ResultsPage({ moduleId, moduleTitle, score, total, questions, studentName, onRetryTest, onNextModule, onBack, t, language }: ResultsPageProps) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    const getMasteryLevel = () => {
        if (pct >= 90) return { label: 'Mastery Achieved! 🏆', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', emoji: '🥇' };
        if (pct >= 75) return { label: 'Great Job! 🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', emoji: '🥈' };
        if (pct >= 50) return { label: 'Good Effort! 💪', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.3)', emoji: '📚' };
        return { label: 'Keep Practicing! 🔥', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', emoji: '💡' };
    };

    const mastery = getMasteryLevel();

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '24px', paddingBottom: '80px', animation: 'fadeIn 0.5s ease' }}>
            {/* Certificate Card */}
            <div style={{
                background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', borderRadius: '32px',
                border: `2px solid ${mastery.border}`, padding: '48px 40px', textAlign: 'center',
                boxShadow: `0 0 60px ${mastery.color}20, 0 25px 50px -12px rgba(0,0,0,0.6)`,
                position: 'relative', overflow: 'hidden', marginBottom: '32px'
            }}>
                {/* Glow background */}
                <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${mastery.color}15 0%, transparent 70%)`, pointerEvents: 'none' }} />

                {/* Trophy/Icon */}
                <div style={{ fontSize: '5rem', marginBottom: '20px', filter: `drop-shadow(0 0 20px ${mastery.color}60)` }}>{mastery.emoji}</div>

                <h1 style={{ color: mastery.color, fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{mastery.label}</h1>
                <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 40px 0' }}>Your test results for <strong style={{ color: '#f1f5f9' }}>{moduleTitle}</strong></p>

                {/* Certificate Block */}
                <div style={{ background: mastery.bg, border: `1px solid ${mastery.border}`, borderRadius: '20px', padding: '32px', marginBottom: '32px' }}>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 8px 0' }}>TOPIC MASTERY CERTIFICATE</p>
                    <p style={{ color: '#94a3b8', margin: '0 0 4px 0', fontSize: '0.9rem' }}>This certifies that</p>
                    <h2 style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 800, margin: '0 0 4px 0' }}>{studentName}</h2>
                    <p style={{ color: '#94a3b8', margin: '0 0 16px 0', fontSize: '0.9rem' }}>has completed the module</p>
                    <p style={{ color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 20px 0' }}>{moduleTitle}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${mastery.color}20`, padding: '8px 20px', borderRadius: '999px', border: `1px solid ${mastery.border}` }}>
                        <span style={{ color: mastery.color, fontWeight: 700, fontSize: '0.85rem' }}>Score: {score}/{total} — {pct}% {pct >= 90 ? '• MASTERY VERIFIED ✓' : ''}</span>
                    </div>
                </div>

                {/* Performance Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '8px' }}>
                    {[
                        { label: 'Correct', value: `${score}`, icon: '✅', color: '#22c55e' },
                        { label: 'Avg. Score', value: `${pct}%`, icon: '📊', color: mastery.color },
                        { label: 'Questions', value: `${total}`, icon: '📋', color: '#38bdf8' }
                    ].map(stat => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
                            <div style={{ color: stat.color, fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Answers Review */}
            <div style={{ background: 'rgba(15,23,42,0.5)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', marginBottom: '32px' }}>
                <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>📋 Answer Review</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {questions.map((q, i) => (
                        <div key={q.id} style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Q{i + 1}</span>
                                <span style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{q.difficulty}</span>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 6px 0', fontWeight: 500 }}>{q.question}</p>
                            <p style={{ color: '#22c55e', fontSize: '0.85rem', margin: 0 }}>✓ {q.correct_answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={onRetryTest} style={{
                    flex: 1, padding: '18px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: '#f1f5f9', fontWeight: 700, fontSize: '1rem',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                    🔄 Try Again (Different Questions)
                </button>
                <button onClick={onNextModule} style={{
                    flex: 1, padding: '18px 24px', borderRadius: '16px', border: 'none',
                    background: 'linear-gradient(90deg, var(--magenta), var(--cyan))',
                    color: '#0f172a', fontWeight: 800, fontSize: '1rem',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 20px rgba(0,240,255,0.25)'
                }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    Next Module →
                </button>
            </div>
        </div>
    );
}
