import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Mic, MicOff } from "lucide-react";
import { translations } from "../translations";
import type { Language } from "../translations";
import { askQuestion } from "../services/api";

interface ChatBotProps {
    language: Language;
    studentProfile: { name: string; age: number; grade: string } | null;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    analogy?: string;
    isError?: boolean;
}

export function ChatBot({ language, studentProfile }: ChatBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const t = translations[language];

    // Initialize Speech Recognition
    useEffect(() => {
        const win = window as any;
        if ('webkitSpeechRecognition' in win || 'SpeechRecognition' in win) {
            const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setInputValue(prev => prev + finalTranscript);
                } else if (interimTranscript) {
                    // Could show interim but letting it replace might be jumpy without specialized state.
                    // For now, let's just append final to keep it simple and clean.
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // Change language mapping for speech recognition
    useEffect(() => {
        if (recognitionRef.current) {
            if (language === 'hi') recognitionRef.current.lang = 'hi-IN';
            else if (language === 'kn') recognitionRef.current.lang = 'kn-IN';
            else recognitionRef.current.lang = 'en-US';
        }
    }, [language]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setInputValue(""); // Clear input when starting new dictation
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    useEffect(() => {
        // Auto-scroll to bottom
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Force English translation for Chatbot Welcome as requested
            const enTranslations = translations['en'];
            const welcomeText = enTranslations.chatbotWelcome?.replace('{name}', studentProfile?.name || '') || `Hello, ${studentProfile?.name || ''}! I am here to help you understand any concept clearly.`;
            setMessages([{
                id: 'welcome',
                role: 'ai',
                content: `👋 ${welcomeText}`
            }]);
        }
    }, [isOpen, messages.length, studentProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue.trim();
        const newMessageId = Date.now().toString();

        setMessages(prev => [...prev, { id: `u-${newMessageId}`, role: 'user', content: userText }]);
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await askQuestion({
                question: userText,
                language: language,
                topic: "General Help",
                student_name: studentProfile?.name,
                student_age: studentProfile?.age,
                student_grade: studentProfile?.grade
            });

            setMessages(prev => [...prev, {
                id: `ai-${newMessageId}`,
                role: 'ai',
                content: res.answer,
                analogy: res.analogy
            }]);
            // Increment doubts solved counter (read by dashboard stats)
            const prev = parseInt(localStorage.getItem('vidya_doubts_count') || '0', 10);
            localStorage.setItem('vidya_doubts_count', String(prev + 1));
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: `e-${newMessageId}`,
                role: 'ai',
                content: t.error + " AI Core Offline.",
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '380px',
                    height: '550px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.15)',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: 'bottom right'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(to right, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0))',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
                                <Sparkles size={18} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                                    {t.appName}
                                </h3>
                                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                    {t.aiCommandCenter}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', borderRadius: '50%', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {messages.map((m) => (
                            <div key={m.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '100%'
                            }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '14px 18px',
                                    borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    backgroundColor: m.role === 'user' ? '#3b82f6' : (m.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 41, 59, 0.8)'),
                                    color: m.role === 'user' ? 'white' : (m.isError ? '#fca5a5' : '#e2e8f0'),
                                    boxShadow: m.role === 'user' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                                    border: m.role === 'user' ? 'none' : `1px solid ${m.isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                                    fontSize: '14px',
                                    lineHeight: 1.5
                                }}>
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', padding: '12px' }}>
                                <div style={{ width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%', animation: 'pulse 1s infinite 0ms' }} />
                                <div style={{ width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%', animation: 'pulse 1s infinite 200ms' }} />
                                <div style={{ width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%', animation: 'pulse 1s infinite 400ms' }} />
                                <span style={{ marginLeft: '8px' }}>{t.generating}</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(15, 23, 42, 0.95)' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isListening ? t.listening : t.searchPlaceholder}
                                style={{
                                    flex: 1,
                                    padding: '14px 16px',
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                style={{
                                    padding: '0 16px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                    opacity: (!inputValue.trim() || isLoading) ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}
                                onMouseEnter={(e) => { if (!(!inputValue.trim() || isLoading)) e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={(e) => { if (!(!inputValue.trim() || isLoading)) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                <Send size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={toggleListening}
                                title={t.clickToSpeak}
                                style={{
                                    padding: '0 16px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    backgroundColor: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                                    color: isListening ? '#ef4444' : '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    animation: isListening ? 'pulse 2s infinite' : 'none'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isListening ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = isListening ? '#ef4444' : 'white'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.color = isListening ? '#ef4444' : '#94a3b8'; }}
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '32px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
