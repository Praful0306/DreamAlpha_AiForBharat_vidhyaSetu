import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { askQuestion } from '../services/api';
import type { TestResult } from '../App';

interface ChartsPageProps {
    testResults?: TestResult[];
    completedModules?: number[];
    t?: any;
    studentProfile?: { name: string; age: number; grade: string } | null;
    language?: string;
    subject?: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    analogy?: string;
    isLoading?: boolean;
    isError?: boolean;
}

const SUGGESTED_DOUBTS = [
    "Explain this concept in simple terms",
    "Give me a real-life example from India",
    "What is the difference between X and Y?",
    "Why is this concept important?",
    "Can you give me a quick quiz on this topic?",
];

const TypingDots = () => (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' }}>
        {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
        ))}
    </div>
);

export function ChartsPage({ studentProfile, language = 'en', subject = '' }: ChartsPageProps) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [topic, setTopic] = useState(subject || '');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleStartSession = () => {
        if (!topic.trim()) return;
        setSessionStarted(true);
        // Welcome message
        setMessages([{
            id: 'welcome',
            role: 'ai',
            text: `👋 Hello${studentProfile ? `, ${studentProfile.name}` : ''}! I'm your AI study companion for **${topic}**.\n\nAsk me anything about this topic — concepts, definitions, real-life examples, or practice questions. I'll explain everything in a clear and simple way! 🚀`,
        }]);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSend = async (overrideText?: string) => {
        const text = (overrideText ?? inputValue).trim();
        if (!text || isLoading) return;

        setInputValue('');

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
        const loadingMsg: ChatMessage = { id: Date.now().toString() + '_loading', role: 'ai', text: '', isLoading: true };
        setMessages(prev => [...prev, userMsg, loadingMsg]);
        setIsLoading(true);

        try {
            const res = await askQuestion({
                language: language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en',
                topic: topic || 'General',
                question: text,
                student_name: studentProfile?.name,
                student_age: studentProfile?.age,
                student_grade: studentProfile?.grade,
            });
            setMessages(prev => prev.map(m =>
                m.id === loadingMsg.id
                    ? { ...m, text: res.answer, analogy: res.analogy, isLoading: false }
                    : m
            ));
        } catch (err: any) {
            setMessages(prev => prev.map(m =>
                m.id === loadingMsg.id
                    ? { ...m, text: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`, isLoading: false, isError: true }
                    : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setSessionStarted(false);
        setTopic(subject || '');
    };

    const renderText = (text: string) => {
        // Simple markdown-ish: **bold**, \n newlines
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0', position: 'relative', background: '#06060a' }}>
            {/* Ambient background */}
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,240,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(180,0,255,0.06) 0, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 5, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '9px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', flexShrink: 0 }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>
                            Back
                        </button>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(180,0,255,0.08)', border: '1px solid rgba(180,0,255,0.2)', borderRadius: '999px', padding: '6px 14px', color: 'var(--magenta)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '12px' }}>
                                🤖 AI DOUBT SOLVER
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                                Ask Your Doubts
                            </h1>
                            <p style={{ color: '#94a3b8', margin: '6px 0 0', fontSize: '1rem' }}>
                                Ask anything about your modules — get clear, simple explanations with examples.
                            </p>
                        </div>
                    </div>
                    {sessionStarted && (
                        <button onClick={handleClearChat} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 16px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /></svg>
                            New Session
                        </button>
                    )}
                </div>

                {/* Topic Setup Card — shown when no session */}
                {!sessionStarted && (
                    <div style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                        {/* Top step indicator */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ flex: 2, height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, var(--magenta), var(--cyan))' }} />
                            <div style={{ flex: 2, height: '3px', borderRadius: '2px', background: 'var(--cyan)' }} />
                            <div style={{ flex: 3, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }} />
                            <div style={{ marginLeft: 'auto', color: '#475569', fontSize: '0.75rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.76"></path></svg>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0, boxShadow: '0 0 20px rgba(0,240,255,0.15)' }}>🧠</div>
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0' }}>Start Your Doubt Session</h2>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Enter the topic or module you need help with, then start asking!</p>
                            </div>
                        </div>

                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                TOPIC OR MODULE NAME
                            </label>
                            <input
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && topic.trim() && handleStartSession()}
                                placeholder="e.g. Photosynthesis, Pythagoras Theorem, World War II..."
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 20px', color: '#e2e8f0', fontSize: '1.1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ffaa" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                                QUICK DOUBT STARTERS
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {SUGGESTED_DOUBTS.map((s, i) => (
                                    <button key={i} onClick={() => setTopic(prev => prev || 'General')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '999px', padding: '8px 16px', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleStartSession}
                            disabled={!topic.trim()}
                            style={{ width: '100%', padding: '18px', borderRadius: '16px', background: topic.trim() ? 'linear-gradient(135deg, var(--cyan), var(--magenta))' : 'rgba(255,255,255,0.05)', color: topic.trim() ? '#0f172a' : '#475569', fontWeight: 900, fontSize: '1.15rem', border: 'none', cursor: topic.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: topic.trim() ? '0 0 30px rgba(0,240,255,0.25)' : 'none', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            Start Doubt Session
                        </button>
                    </div>
                )}

                {/* Chat Area */}
                {sessionStarted && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', flex: 1 }}>
                        {/* Topic badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '999px', padding: '6px 14px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ffaa', animation: 'pulse 2s infinite' }} />
                                <span style={{ color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>SESSION: {topic.toUpperCase()}</span>
                            </div>
                            <span style={{ color: '#475569', fontSize: '0.8rem' }}>{messages.filter(m => m.role === 'user').length} questions asked</span>
                        </div>

                        {/* Messages */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', minHeight: '400px' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                                    {/* Avatar row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, var(--cyan), #3b82f6)' : 'linear-gradient(135deg, var(--magenta), #7b00ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                                            {msg.role === 'user' ? '👤' : '🤖'}
                                        </div>
                                        <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {msg.role === 'user' ? (studentProfile?.name || 'You') : 'Vidya AI'}
                                        </span>
                                    </div>

                                    {/* Bubble */}
                                    <div style={{
                                        maxWidth: '80%', padding: '16px 20px', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(59,130,246,0.1))' : msg.isError ? 'rgba(239,68,68,0.08)' : 'rgba(15,23,42,0.8)',
                                        border: msg.role === 'user' ? '1px solid rgba(0,240,255,0.2)' : msg.isError ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.06)',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                    }}>
                                        {msg.isLoading ? (
                                            <TypingDots />
                                        ) : (
                                            <>
                                                <p style={{ color: msg.role === 'user' ? '#e2e8f0' : '#cbd5e1', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                                                    {renderText(msg.text)}
                                                </p>
                                                {msg.analogy && (
                                                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,255,170,0.04)', border: '1px solid rgba(0,255,170,0.15)', borderRadius: '12px' }}>
                                                        <p style={{ color: '#00ffaa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>💡 Real-Life Analogy</p>
                                                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{msg.analogy}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested follow-ups */}
                        {messages.length > 0 && !isLoading && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {['Explain more simply', 'Give me an example', 'Quiz me on this'].map((s, i) => (
                                    <button key={i} onClick={() => handleSend(s)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '999px', padding: '7px 14px', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; e.currentTarget.style.color = '#00f0ff'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Bar */}
                        <div style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '20px', padding: '6px 6px 6px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 0 30px rgba(0,240,255,0.05)', transition: 'border-color 0.3s' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,240,255,0.4)" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                <input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Ask your doubt about "${topic}"...`}
                                    disabled={isLoading}
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '1rem', outline: 'none', padding: '10px 0' }}
                                />
                            </div>
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim() || isLoading}
                                style={{ background: inputValue.trim() && !isLoading ? 'linear-gradient(135deg, var(--cyan), var(--magenta))' : 'rgba(255,255,255,0.05)', color: inputValue.trim() && !isLoading ? '#0f172a' : '#475569', border: 'none', borderRadius: '14px', padding: '14px 20px', fontWeight: 800, fontSize: '0.9rem', cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                            >
                                {isLoading ? (
                                    <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,240,255,0.3)', borderTop: '2px solid var(--cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Thinking...</>
                                ) : (
                                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> Send</>
                                )}
                            </button>
                        </div>
                        <p style={{ color: '#334155', fontSize: '0.75rem', textAlign: 'center', marginTop: '12px' }}>Press <kbd style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: '#64748b' }}>Enter</kbd> to send · Powered by Amazon Bedrock</p>
                    </div>
                )}

                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
}
