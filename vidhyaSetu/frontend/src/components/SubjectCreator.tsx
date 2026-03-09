import { useState } from "react";
import { Language } from '../translations';

interface SubjectCreatorProps {
    onGenerate: (subject: string, notes: string) => void;
    onCancel?: () => void;
    isLoading: boolean;
    t: any;
    language: Language;
}

export function SubjectCreator({ onGenerate, onCancel, isLoading, t, language }: SubjectCreatorProps) {
    const [subject, setSubject] = useState("");
    const [notes, setNotes] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (subject.trim()) {
            onGenerate(subject.trim(), notes.trim());
        }
    }

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Left Panel: Context */}
            <section className="left-panel">
                <div className="cyan-accent-top"></div>
                <div className="cyan-accent-left"></div>

                <div className="icon-box-wrapper">
                    <div className="icon-box">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                    </div>
                </div>

                <h2 className="hero-title">
                    {t?.designModule || "Design your\nlearning module"}
                </h2>
                <p className="hero-desc">
                    {t?.designModuleDesc || "Interface ready. Initialize neural mapping by defining the core subject parameters and reference data sets."}
                </p>

                <div className="system-status">
                    <div className="status-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="status-icon" stroke="#00ffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <span>SYSTEM: STABLE</span>
                    </div>
                    <div className="status-item" style={{ color: 'var(--magenta)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="status-icon" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                            <rect x="9" y="9" width="6" height="6"></rect>
                            <line x1="9" y1="1" x2="9" y2="4"></line>
                            <line x1="15" y1="1" x2="15" y2="4"></line>
                            <line x1="9" y1="20" x2="9" y2="23"></line>
                            <line x1="15" y1="20" x2="15" y2="23"></line>
                            <line x1="20" y1="9" x2="23" y2="9"></line>
                            <line x1="20" y1="14" x2="23" y2="14"></line>
                            <line x1="1" y1="9" x2="4" y2="9"></line>
                            <line x1="1" y1="14" x2="4" y2="14"></line>
                        </svg>
                        <span>LATENCY: 24MS</span>
                    </div>
                </div>
            </section>

            {/* Right Panel: Form Inputs */}
            <section className="right-panel">
                <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="form-group">
                        <label className="glow-label">
                            {t?.coreSubject || "CORE SUBJECT OR TOPIC"}
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="tech-input"
                                placeholder={t?.coreSubjectPlaceholder || "e.g. Advanced Machine Learning, Quantum Physics"}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                disabled={isLoading}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div className="form-group flex-1" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label className="glow-label">
                                {t?.refContext || "REFERENCE CONTEXT / SYLLABUS DATA"}
                            </label>
                            <span className="optional-tag">{t?.optional || "OPTIONAL"}</span>
                        </div>
                        <div className="input-wrapper flex-1" style={{ flex: 1 }}>
                            <textarea
                                className="tech-input textarea"
                                placeholder={t?.refContextPlaceholder || "Paste lecture notes, syllabus bullet points, or reference text for the AI context window..."}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={isLoading}
                                style={{ width: '100%', minHeight: '160px', height: '100%', resize: 'none' }}
                            ></textarea>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '20px' }}>
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isLoading}
                                className="tech-input"
                                style={{
                                    flex: 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    color: 'var(--text-dim)',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    padding: '20px'
                                }}
                            >
                                {t?.cancel || "CANCEL"}
                            </button>
                        )}
                        <button
                            type="submit"
                            className="generate-btn"
                            style={{
                                flex: 2,
                                opacity: (!subject.trim() || isLoading) ? 0.6 : 1,
                                cursor: (!subject.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                marginTop: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                background: 'linear-gradient(90deg, var(--cyan) 0%, var(--magenta) 100%)',
                                borderRadius: '4px',
                                padding: '20px',
                                color: '#000',
                                fontWeight: '800',
                                letterSpacing: '4px',
                                textTransform: 'uppercase',
                                border: 'none',
                                overflow: 'hidden'
                            }}
                            disabled={!subject.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner" style={{ marginRight: '12px', borderTopColor: '#000' }}></div>
                                    {t?.generating || "GENERATING..."}
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3l-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3l5.8-1.9-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                                    </svg>
                                    {t?.generateCurric || "GENERATE CURRICULUM"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
