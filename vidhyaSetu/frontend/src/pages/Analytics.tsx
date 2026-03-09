import { Activity, Target, Trophy, TrendingUp, Brain, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface TestResult {
    moduleId: number;
    score: number;
    total: number;
    timestamp: string;
}

interface AnalyticsProps {
    t: any;
    completedModules?: number[];
    testResults?: TestResult[];
    studentProfile?: { name: string } | null;
    language?: any;
}

export function Analytics({ t, completedModules = [], testResults = [], studentProfile, language }: AnalyticsProps) {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);

    // AI Logic: Calculate "Cognitive Growth" based on mastery and accuracy
    const accuracy = testResults.length > 0
        ? Math.round(testResults.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / testResults.length * 100)
        : 0;

    const masteryProgress = completedModules.length > 0 ? (completedModules.length / 10) * 100 : 0; // Assuming 10 modules total
    const cognitiveGrowth = Math.min(100, Math.round((accuracy * 0.6) + (masteryProgress * 0.4)));

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(cognitiveGrowth);
        }, 500);
        return () => clearTimeout(timer);
    }, [cognitiveGrowth]);

    return (
        <div className="analytics-container animate-fade-in-up" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
            <main style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', marginBottom: '16px', fontSize: '0.8rem',
                                padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s', width: 'max-content'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        >
                            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                            {t?.backToDashboard || "Back to Dashboard"}
                        </button>
                        <h1 style={{ color: '#f1f5f9', fontSize: '3rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}>
                            Neural <span style={{ color: 'var(--cyan)', textShadow: '0 0 20px rgba(0,240,255,0.3)' }}>Analytics</span>
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 500, marginTop: '8px' }}>
                            {t?.performanceInsights || "AI-powered cognitive mapping for"} <span style={{ color: 'var(--magenta)' }}>Operator_{studentProfile?.name || "User"}</span>
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Engine</p>
                            <p style={{ color: '#00ff80', fontSize: '0.9rem', fontWeight: 600 }}>v4.2.0 • Online</p>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={20} color="#00ff80" />
                        </div>
                    </div>
                </div>

                {/* Hero Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '48px' }}>

                    {/* Radial Progress Card */}
                    <div className="panel" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '32px' }}>Cognitive Growth</h3>

                        <div className="cognitive-radial" style={{ '--progress': progress } as any}>
                            <div className="cognitive-radial-pulse"></div>
                            <div className="cognitive-radial-content">
                                <p style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>{progress}<span style={{ fontSize: '1.2rem', color: 'var(--cyan)' }}>%</span></p>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Mastery Level</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                            <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 700, marginBottom: '4px' }}>ACCURACY</p>
                                <p style={{ color: 'var(--cyan)', fontWeight: 700 }}>{accuracy}%</p>
                            </div>
                            <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 700, marginBottom: '4px' }}>STREAK</p>
                                <p style={{ color: 'var(--magenta)', fontWeight: 700 }}>12 Days</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights & Evolution */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                        {/* Insight Card 1 */}
                        <div className="panel" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 240, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(0,240,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Brain size={20} color="var(--cyan)" />
                                </div>
                                <div style={{ background: 'rgba(0,240,255,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 700 }}>PEAK STATE</div>
                            </div>
                            <div>
                                <h4 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Logical Synthesis</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>Your neural patterns show exceptional efficiency in connecting mathematical concepts to real-world physics scenarios.</p>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={16} color="#00ff80" />
                                <span style={{ color: '#00ff80', fontSize: '0.8rem', fontWeight: 600 }}>+15% Growth this session</span>
                            </div>
                        </div>

                        {/* Insight Card 2 */}
                        <div className="panel" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(180, 0, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(180,0,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Target size={20} color="var(--magenta)" />
                                </div>
                                <div style={{ background: 'rgba(180,0,255,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', color: 'var(--magenta)', fontWeight: 700 }}>GROWTH AREA</div>
                            </div>
                            <div>
                                <h4 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Quantum Foundations</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>Analysis suggests a minor gap in foundational relativity concepts. The AI recommends a "Bridge Module" before proceeding.</p>
                            </div>
                            <button style={{ marginTop: 'auto', background: 'rgba(180, 0, 255, 0.1)', border: '1px solid rgba(180, 0, 255, 0.2)', padding: '10px', borderRadius: '12px', color: 'var(--magenta)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(180, 0, 255, 0.2)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(180, 0, 255, 0.1)'}>
                                PREPARE BRIDGE
                            </button>
                        </div>

                        {/* Wide Action Card */}
                        <div className="panel animate-pulse-glow" style={{ gridColumn: 'span 2', padding: '32px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(180, 0, 255, 0.1) 100%)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={30} color="var(--cyan)" />
                                </div>
                                <div>
                                    <h4 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{t?.activateLearningPath || "Activate Learning Path"}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Projected Success Probability: <span style={{ color: '#00ff80', fontWeight: 700 }}>88.4%</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/learning-path')}
                                style={{ padding: '16px 32px', borderRadius: '16px', background: '#fff', color: '#000', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 20px #fff'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                GO TO HUB
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Activity & Prediction */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

                    <div className="panel" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700 }}>Neural Activity Feed</h3>
                            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>LAST 7 DAYS</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { title: 'Mastered: Kinematics Core', time: '2 hours ago', type: 'mastery' },
                                { title: 'Peak Accuracy: 98% in Calculus', time: 'Yesterday', type: 'peak' },
                                { title: 'Started: Quantum Mechanics', time: '2 days ago', type: 'start' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.type === 'mastery' ? '#00ff80' : item.type === 'peak' ? 'var(--magenta)' : 'var(--cyan)' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</p>
                                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.time}</p>
                                    </div>
                                    <ChevronRight size={16} color="#334155" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="panel" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        <Trophy size={48} color="#ffd700" style={{ margin: '0 auto 24px', filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.3))' }} />
                        <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Elite Status Near</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Complete 2 more modules with {'>'}90% accuracy to unlock the "Neural Architect" badge.</p>
                        <div style={{ height: '8px', width: '100%', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '75%', background: 'linear-gradient(to right, #ffd700, #ff8c00)', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}></div>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '12px', fontWeight: 700 }}>75% TO NEXT RANK</p>
                    </div>

                </div>

            </main>
        </div>
    );
}
