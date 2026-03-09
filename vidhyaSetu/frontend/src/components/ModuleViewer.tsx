import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";
import { ArrowLeft, BrainCircuit, Volume2, Square, FlaskConical } from "lucide-react";

interface ModuleViewerProps {
    moduleId: number;
    title: string;
    subject: string;
    explanation: string;
    mermaidCode: string;
    quizQuestion: string;
    quizAnswer: string;
    onBack: () => void;
    onPass: (moduleId: number) => void;
    onFail: (moduleId: number) => void;
    onTakeTest: (moduleId: number) => void;
    isLoadingAdaptive: boolean;
    t: any;
    language: string;
}

export function ModuleViewer({
    moduleId,
    title,
    subject,
    explanation,
    mermaidCode,
    onBack,
    onTakeTest,
    isLoadingAdaptive,
    t,
    language
}: ModuleViewerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [mermaidFailed, setMermaidFailed] = useState(false);
    const mermaidRef = useRef<HTMLDivElement>(null);

    // Render Mermaid diagram
    useEffect(() => {
        if (!mermaidCode || !mermaidRef.current) return;

        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
                primaryColor: '#0f2a40',
                primaryTextColor: '#38bdf8',
                primaryBorderColor: '#38bdf8',
                lineColor: '#38bdf8',
                secondaryColor: '#0a1a2a',
                tertiaryColor: '#0f172a',
                background: '#0f172a',
                mainBkg: '#0f2a40',
                nodeBorder: '#38bdf8',
                clusterBkg: '#0a1a2a',
                titleColor: '#f1f5f9',
                edgeLabelBackground: '#0f172a',
                fontFamily: 'Inter, sans-serif',
            }
        });

        const id = `mermaid-${Date.now()}`;
        // Clean code: remove markdown wrappers, keep raw mermaid syntax
        const cleanedCode = mermaidCode
            .replace(/```mermaid\n?/g, '')
            .replace(/```/g, '')
            .trim();

        mermaidRef.current.innerHTML = '';
        setMermaidFailed(false);

        mermaid.render(id, cleanedCode)
            .then(result => {
                if (mermaidRef.current) {
                    if (result.svg.includes('Syntax error')) {
                        setMermaidFailed(true);
                    } else {
                        mermaidRef.current.innerHTML = result.svg;
                    }
                }
            })
            .catch(() => setMermaidFailed(true));
    }, [mermaidCode]);

    // Cleanup TTS on unmount
    useEffect(() => {
        return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
    }, []);

    const toggleAudio = () => {
        if (!('speechSynthesis' in window)) return;
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            const plainText = explanation.replace(/#{1,6}\s/g, '').replace(/[*_`\[\]()]/g, '');
            const utterance = new SpeechSynthesisUtterance(plainText);
            if (language === 'hi') utterance.lang = 'hi-IN';
            else if (language === 'kn') utterance.lang = 'kn-IN';
            else utterance.lang = 'en-US';
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    if (isLoadingAdaptive) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(0,240,255,0.15)', borderTopColor: 'var(--cyan)', animation: 'spin 1s linear infinite' }} />
                <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Adapting Lesson for You...</h2>
                <p style={{ color: '#94a3b8', maxWidth: '400px', margin: 0 }}>We noticed you found this topic tricky. We're rewriting the explanation with a simpler approach just for you!</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '24px auto', paddingBottom: '80px', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Back Button */}
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '24px', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                <ArrowLeft size={20} /> {t?.backToCourse || "Back to Course"}
            </button>

            {/* Module Card */}
            <div style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(15,23,42,0) 100%)', padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t?.modulePrefix || "Module"} {moduleId}
                        </span>
                        <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '14px' }}>{subject}</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{title}</h1>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Read through the lesson carefully, then take the test at the bottom to unlock the next module.</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {/* Mermaid Concept Map */}
                    {mermaidCode && !mermaidFailed && (
                        <div style={{ marginBottom: '40px', backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: '20px', padding: '32px', border: '1px solid rgba(56,189,248,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 24px 0' }}>
                                <BrainCircuit size={18} /> {t?.conceptMap || "Concept Map"}
                            </h3>
                            <div ref={mermaidRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '150px' }} />
                        </div>
                    )}

                    {/* Core Concepts Header + Audio */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                            {t?.coreConcepts || "Core Concepts"}
                        </h3>
                        <button onClick={toggleAudio} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                            background: isPlaying ? 'rgba(239,68,68,0.1)' : 'rgba(56,189,248,0.1)',
                            border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.2)'}`,
                            color: isPlaying ? '#ef4444' : '#38bdf8', borderRadius: '12px',
                            cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            {isPlaying ? <Square size={16} /> : <Volume2 size={16} />}
                            {isPlaying ? (t?.stopAudio || "Stop") : (t?.readAloud || "Read Aloud")}
                        </button>
                    </div>

                    {/* Lesson Content */}
                    <div className="prose prose-invert prose-lg max-w-none" style={{
                        color: '#cbd5e1', fontSize: '16px', lineHeight: 1.9,
                    }}>
                        <ReactMarkdown
                            components={{
                                h2: ({ children }) => <h2 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 800, margin: '32px 0 16px 0', paddingBottom: '8px', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>{children}</h2>,
                                h3: ({ children }) => <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 12px 0' }}>{children}</h3>,
                                p: ({ children }) => <p style={{ margin: '0 0 16px 0', color: '#cbd5e1', lineHeight: 1.8 }}>{children}</p>,
                                ul: ({ children }) => <ul style={{ margin: '8px 0 20px 0', paddingLeft: '0', listStyle: 'none' }}>{children}</ul>,
                                li: ({ children }) => <li style={{ margin: '0 0 12px 0', padding: '10px 16px', background: 'rgba(56,189,248,0.04)', borderRadius: '8px', borderLeft: '3px solid rgba(56,189,248,0.4)', color: '#e2e8f0', lineHeight: 1.7, display: 'flex', gap: '8px', alignItems: 'flex-start' }}><span style={{ color: '#38bdf8', flexShrink: 0 }}>▸</span><span>{children}</span></li>,
                                ol: ({ children }) => <ol style={{ margin: '8px 0 20px 0', paddingLeft: '0', listStyle: 'none', counterReset: 'steps' }}>{children}</ol>,
                                strong: ({ children }) => <strong style={{ color: '#f1f5f9', fontWeight: 700 }}>{children}</strong>,
                                code: ({ children }) => <code style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '6px', padding: '2px 8px', color: '#38bdf8', fontSize: '0.9em', fontFamily: 'monospace' }}>{children}</code>,
                                pre: ({ children }) => <pre style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px', padding: '20px 24px', overflowX: 'auto', margin: '16px 0' }}>{children}</pre>,
                            }}
                        >{explanation}</ReactMarkdown>
                    </div>
                </div>

                {/* Take Test CTA — bottom of card */}
                <div style={{ padding: '0 40px 40px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px', marginTop: '8px' }}>
                    <div style={{ background: 'rgba(0,240,255,0.04)', borderRadius: '20px', border: '1px solid rgba(0,240,255,0.12)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
                        <div>
                            <h4 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>Ready to test your knowledge?</h4>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Take the test — 6 questions from basic to advanced. Pass to unlock the next module!</p>
                        </div>
                        <button
                            onClick={() => onTakeTest(moduleId)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px', borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(135deg, var(--magenta), var(--cyan))',
                                color: '#0f172a', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(0,240,255,0.25)', transition: 'all 0.3s', whiteSpace: 'nowrap', flexShrink: 0
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,240,255,0.35)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,240,255,0.25)'; }}>
                            <FlaskConical size={20} />
                            Take the Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
