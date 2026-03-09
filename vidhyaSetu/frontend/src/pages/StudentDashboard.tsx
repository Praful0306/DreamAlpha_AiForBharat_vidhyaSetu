import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import type { ModuleSummary } from '../components/CourseDashboard';
import type { Language } from '../translations';

interface StudyTask {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

interface TestResult {
    moduleId: number;
    score: number;
    total: number;
    timestamp: string;
}

interface StudentDashboardProps {
    subject: string;
    modules: ModuleSummary[];
    completedModules: number[];
    testResults?: TestResult[];
    onStartModule: (id: number) => void;
    searchTopic?: string;
    setSearchTopic?: (topic: string) => void;
    handleQuickStart?: () => void;
    language: Language;
    t: any;
    isLoading?: boolean;
}

function computeStreak(): number {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = localStorage.getItem('vidya_last_study_date');
        let streak = parseInt(localStorage.getItem('vidya_streak') || '0', 10);
        if (!lastDate) {
            // First time
            localStorage.setItem('vidya_last_study_date', today);
            localStorage.setItem('vidya_streak', '1');
            return 1;
        }
        if (lastDate === today) return streak;
        const last = new Date(lastDate);
        const diff = Math.floor((new Date(today).getTime() - last.getTime()) / 86400000);
        if (diff === 1) {
            streak += 1;
        } else {
            streak = 1; // Reset streak on gap
        }
        localStorage.setItem('vidya_last_study_date', today);
        localStorage.setItem('vidya_streak', String(streak));
        return streak;
    } catch { return 0; }
}

export function StudentDashboard({ subject, modules, completedModules, testResults = [], onStartModule, searchTopic = "", setSearchTopic = () => { }, handleQuickStart: externalQuickStart, t }: StudentDashboardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = location.pathname;

    // Dynamic stats
    const [currentStreak] = useState<number>(() => computeStreak());
    const doubtsSolved = parseInt(localStorage.getItem('vidya_doubts_count') || '0', 10);

    // Study Tasks State with localStorage persistence
    const [tasks, setTasks] = useState<StudyTask[]>(() => {
        try { return JSON.parse(localStorage.getItem('vidya_study_tasks') || '[]'); } catch { return []; }
    });
    const [newTaskText, setNewTaskText] = useState('');
    const [showTaskInput, setShowTaskInput] = useState(false);

    const saveTasks = (updated: StudyTask[]) => {
        setTasks(updated);
        localStorage.setItem('vidya_study_tasks', JSON.stringify(updated));
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        const task: StudyTask = { id: Date.now().toString(), text: newTaskText.trim(), completed: false, createdAt: new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric' }) };
        saveTasks([task, ...tasks]);
        setNewTaskText('');
        setShowTaskInput(false);
    };

    const handleToggleTask = (id: string) => {
        saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTask = (id: string) => {
        saveTasks(tasks.filter(t => t.id !== id));
    };

    const handleClearCompleted = () => {
        saveTasks(tasks.filter(t => !t.completed));
    };

    const pendingCount = tasks.filter(t => !t.completed).length;

    const handleQuickStart = () => {
        if (!searchTopic.trim()) return;
        if (externalQuickStart) {
            externalQuickStart();
        } else {
            navigate('/create', { state: { initialSubject: searchTopic } });
        }
    };

    const renderMainContent = () => {
        if (activeTab === '/dashboard/modules') {
            const overallProgress = modules.length > 0 ? Math.round((completedModules.length / modules.length) * 100) : 0;

            return (
                <main className="dashboard-content animate-fade-in-up" style={{ padding: '40px', maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0 0 8px 0', transition: 'color 0.2s', width: 'max-content' }} onMouseOver={e => e.currentTarget.style.color = '#00f0ff'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>
                                    Back to Dashboard
                                </button>
                                <h1 style={{ color: '#f1f5f9', fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>{t?.modules || "Course Modules"}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>Subject: {subject || t?.none || 'None'}</p>
                                    <span style={{ color: '#475569' }}>•</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(6,232,249,0.1)', border: '1px solid rgba(6,232,249,0.2)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)' }} className="animate-pulse"></div>
                                        <span style={{ color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t?.activeSector || "ACTIVE_SECTOR"}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--cyan)', fontSize: '1.5rem', fontWeight: 700 }}>{overallProgress}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {
                        modules.length === 0 ? (
                            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(24, 51, 53, 0.6)', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid rgba(6, 232, 249, 0.1)' }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px', color: 'var(--cyan)', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '12px' }}>No Modules Found</h3>
                                <p style={{ color: '#94a3b8' }}>You haven't generated any modules yet. Go back to Dashboard to Quick Start a course!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                                {modules.map((mod, index) => {
                                    const isCompleted = completedModules.includes(mod.id);
                                    const isCurrentActive = !isCompleted &&
                                        (index === 0 || completedModules.includes(modules[index - 1].id));

                                    if (isCompleted) {
                                        return (
                                            <div key={mod.id} style={{ background: 'rgba(24, 51, 53, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 255, 170, 0.3)', boxShadow: '0 0 15px rgba(0, 255, 170, 0.05)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.3s', cursor: 'pointer' }} onClick={() => onStartModule(mod.id)} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                                <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(24, 51, 53, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '999px', padding: '4px', border: '1px solid rgba(0, 255, 170, 0.3)', color: '#00ffaa' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                                                </div>
                                                <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#0a1516', borderBottom: '1px solid rgba(0, 255, 170, 0.2)' }}>
                                                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(0, 255, 170, 0.1) 0%, transparent 70%)' }}></div>
                                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24, 51, 53, 1), transparent)' }}></div>
                                                </div>
                                                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.025em', margin: 0 }}>Module {index + 1}: {mod.title}</h3>
                                                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>Part of your {subject} path.</p>
                                                    </div>
                                                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(33, 71, 74, 0.3)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#00ffaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status: Completed</span>
                                                        </div>
                                                        <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', height: '40px', padding: '0 16px', background: 'rgba(24, 51, 53, 1)', border: '1px solid rgba(0, 255, 170, 0.3)', color: '#00ffaa', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.025em', cursor: 'pointer', transition: 'background-color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = '#21474a'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(24, 51, 53, 1)'}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                                                            Review Sector
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isCurrentActive) {
                                        return (
                                            <div key={mod.id} style={{ background: 'rgba(24, 51, 53, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(6, 232, 249, 0.5)', boxShadow: '0 0 20px rgba(6, 232, 249, 0.1)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.3s', cursor: 'pointer' }} onClick={() => onStartModule(mod.id)} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #ff00ff, #06e8f9)', zIndex: 10 }}></div>
                                                <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#0a1516', borderBottom: '1px solid rgba(6, 232, 249, 0.2)' }}>
                                                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at center, rgba(6, 232, 249, 0.1) 0%, transparent 70%)' }}></div>
                                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24, 51, 53, 1), transparent)' }}></div>
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(6,232,249,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6,232,249,0.5)', color: 'var(--cyan)' }} className="animate-pulse">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.025em', margin: 0 }}>Module {index + 1}: {mod.title}</h3>
                                                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>Dive into the active training sector to master these concepts.</p>
                                                    </div>
                                                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(33, 71, 74, 0.3)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="animate-pulse">In Progress</span>
                                                        </div>
                                                        <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', height: '40px', padding: '0 16px', background: 'linear-gradient(90deg, rgba(255,0,255,0.8), rgba(6,232,249,0.8))', border: 'none', color: '#0f172a', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.025em', cursor: 'pointer', boxShadow: '0 0 15px rgba(6,232,249,0.3)', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(90deg, #ff00ff, #06e8f9)' }} onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(90deg, rgba(255,0,255,0.8), rgba(6,232,249,0.8))' }}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                                            Continue Training
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={mod.id} style={{ background: 'rgba(24, 51, 53, 0.6)', backdropFilter: 'blur(12px)', border: '1px dashed rgba(255, 255, 255, 0.1)', opacity: 0.6, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                            <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(15, 33, 35, 0.2)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(15, 33, 35, 0.8)', padding: '4px 12px', borderRadius: '4px', border: '1px solid #334155' }}>Restricted Access</span>
                                            </div>
                                            <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#0a1516', filter: 'grayscale(100%)', opacity: 0.5 }}>
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24, 51, 53, 1), transparent)' }}></div>
                                            </div>
                                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '16px', opacity: 0.7 }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '-0.025em', margin: 0 }}>Module {index + 1}: {mod.title}</h3>
                                                </div>
                                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(33, 71, 74, 0.3)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '4px', background: 'rgba(15, 33, 35, 0.5)', border: '1px solid #1e293b' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', fontWeight: 500 }}>Complete prior modules to unlock</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    }
                </main >
            );
        }

        if (activeTab === '/dashboard/tests') {
            return (
                <main className="dashboard-content animate-fade-in-up" style={{ padding: '40px', maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0 0 8px 0', transition: 'color 0.2s', width: 'max-content' }} onMouseOver={e => e.currentTarget.style.color = '#00f0ff'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>
                                    Back to Dashboard
                                </button>
                                <h1 style={{ color: '#f1f5f9', fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>{t?.knowledgeChecks || "Knowledge Checks"}</h1>
                                <p style={{ color: 'var(--cyan)', fontSize: '1.125rem', fontWeight: 500, margin: '8px 0 0 0', opacity: 0.8 }}>Subject: {subject || t?.none || 'None'}</p>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                <div style={{ background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', padding: '20px', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t?.averageScore || "Average Score"}</p>
                                    <p style={{ color: '#00ffaa', fontSize: '1.875rem', fontWeight: 700, margin: 0, textShadow: '0 0 10px rgba(0,255,170,0.5)' }}>
                                        {testResults.length > 0 ? Math.round(testResults.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / testResults.length * 100) : 0}%
                                    </p>
                                </div>
                                <div style={{ background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', padding: '20px', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t?.totalTests || "Tests Taken"}</p>
                                    <p style={{ color: 'var(--cyan)', fontSize: '1.875rem', fontWeight: 700, margin: 0, textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>{testResults.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Empty State Panel or Test History Grid */}
                    {testResults.length === 0 ? (
                        <div style={{ background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 240, 255, 0.15)', boxShadow: '0 4px 30px rgba(0,0,0,0.1)', borderRadius: '12px', padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,240,255,0.05), transparent)', opacity: 0.5 }}></div>
                            <div style={{ position: 'relative', zIndex: 10, color: 'var(--cyan)', marginBottom: '24px' }}>
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.6))' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '16px', position: 'relative', zIndex: 10, letterSpacing: '-0.025em' }}>{t?.awaitingData || "No new tests available."}</h3>
                            <p style={{ color: '#94a3b8', maxWidth: '450px', marginBottom: '40px', position: 'relative', zIndex: 10, fontSize: '1.125rem', lineHeight: 1.6 }}>{t?.completeModulesPrompt || "Complete the next module to unlock its stress-free knowledge check and continue your mastery."}</p>
                            <button onClick={() => navigate('/dashboard/modules')} style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '160px', height: '48px', padding: '0 32px', borderRadius: '8px', background: 'rgba(20, 22, 30, 0.9)', border: '1px solid rgba(0, 240, 255, 0.4)', color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.025em', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(0,240,255,0.1)' })} onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(20, 22, 30, 0.9)' })}>
                                {t?.modules || "Go to Modules"}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                            {testResults.slice().reverse().map((result, idx) => {
                                const mod = modules.find(m => m.id === result.moduleId);
                                const scorePct = Math.round((result.score / result.total) * 100);
                                const isPassed = scorePct >= 50;
                                const dateStr = new Date(result.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                                return (
                                    <div key={idx} style={{ background: 'rgba(24, 51, 53, 0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${isPassed ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.3s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mod?.title || `Module ${result.moduleId}`}</h3>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>{dateStr}</p>
                                                </div>
                                                <div style={{ background: isPassed ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${isPassed ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255, 68, 68, 0.2)'}` }}>
                                                    <span style={{ color: isPassed ? '#00ffaa' : '#ff4444', fontWeight: 700, fontSize: '0.875rem' }}>{isPassed ? 'PASSED' : 'FAILED'}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: isPassed ? '#00ffaa' : '#ff4444', lineHeight: 1 }}>{scorePct}%</span>
                                                <span style={{ color: '#94a3b8', fontSize: '1rem', paddingBottom: '4px' }}>({result.score} / {result.total})</span>
                                            </div>

                                            <div style={{ height: '6px', width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '999px', overflow: 'hidden', marginTop: '8px' }}>
                                                <div style={{ height: '100%', width: `${scorePct}%`, background: isPassed ? 'var(--cyan)' : '#ff4444', boxShadow: `0 0 10px ${isPassed ? 'rgba(0,240,255,0.5)' : 'rgba(255,68,68,0.5)'}` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            );
        }

        // Default Dashboard View
        return (
            <main className="dashboard-content animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* Welcome Banner */}
                <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: '40px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(at 0% 0%, rgba(0,240,255,0.05) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(180,0,255,0.05) 0, transparent 50%)', zIndex: 0 }}></div>
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,240,255,0.1)', border: '2px solid rgba(0,240,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0, 238, 255, 0.2)' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div>
                            <p className="neon-text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{t?.welcomeBack || "Welcome back, Operator"}</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '999px', border: '1px solid rgba(0,240,255,0.2)', marginTop: '12px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} className="animate-pulse"></span>
                                <span style={{ color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t?.neuralSync || "Neural Sync Status: Optimal"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                    {/* Main Content Area */}
                    <div className="dashboard-main-col">

                        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: '48px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', textAlign: 'center' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,240,255,0.08), transparent)', pointerEvents: 'none' }}></div>
                            <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, position: 'relative', zIndex: 10 }}>{t?.whatToMaster || "What do you want to master today?"}</h1>

                            <div className="quick-start-input-group" style={{ width: '100%', maxWidth: '600px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(0,240,255,0.3)', position: 'relative', zIndex: 10, transition: 'all 0.3s' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(0,240,255,0.2), 0 0 15px rgba(0,240,255,0.2)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <input
                                    type="text"
                                    placeholder={t?.searchPlaceholder || "e.g., Advanced Neural Networks, String Theory..."}
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#f1f5f9', padding: '16px 24px', fontSize: '1rem', outline: 'none' }}
                                    value={searchTopic}
                                    onChange={(e) => setSearchTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleQuickStart()}
                                />
                                <button className="generate-btn" onClick={handleQuickStart} style={{ height: '100%', padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(90deg, var(--magenta), var(--cyan))', color: '#0f172a', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.3s' }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.5)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.boxShadow = 'none'; }}>
                                    {t?.generateCourse || "Generate Path"}
                                </button>
                            </div>
                        </div>

                        {/* Current Journey Tracking */}
                        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: '20px' }}>
                                <h2 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle></svg>
                                    {t?.currentJourney || "Current Journey"}: <span className="neon-text-gradient">{subject || t?.none || 'None'}</span>
                                </h2>
                                {modules.length > 0 && <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(0,240,255,0.7)', border: '1px solid rgba(0,240,255,0.3)', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,240,255,0.1)' }}>{t?.activeSector || "ACTIVE_SECTOR"}</span>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                                {modules.length > 0 && <div style={{ position: 'absolute', top: '16px', bottom: '16px', left: '24px', width: '2px', background: 'rgba(0,240,255,0.2)', zIndex: 0 }}></div>}

                                {modules.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>{t?.noJourneyPrompt || "Use the Quick Start above to generate a course."}</div>
                                ) : (
                                    modules.map((mod, index) => {
                                        const isCompleted = completedModules.includes(mod.id);
                                        const isCurrentActive = !isCompleted && (index === 0 || completedModules.includes(modules[index - 1].id));
                                        const isLocked = !isCompleted && !isCurrentActive;

                                        return (
                                            <div key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 10, opacity: isLocked ? 0.6 : 1, cursor: (isCompleted || isCurrentActive) ? 'pointer' : 'not-allowed' }}
                                                onClick={() => (isCompleted || isCurrentActive) ? onStartModule(mod.id) : null}>

                                                {/* Icon Node */}
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1516',
                                                    border: isCompleted ? '1px solid #22c55e' : isCurrentActive ? '2px solid var(--cyan)' : '1px solid #334155',
                                                    boxShadow: isCompleted ? '0 0 10px rgba(34,197,94,0.3)' : isCurrentActive ? '0 0 15px rgba(0,240,255,0.5)' : 'none'
                                                }}>
                                                    {isCompleted && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                                                    {isCurrentActive && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                                                    {isLocked && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                                                </div>

                                                {/* Card */}
                                                <div style={{
                                                    flex: 1, padding: '16px', borderRadius: '12px', background: isLocked ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)' : 'rgba(15,23,42,0.6)',
                                                    border: isCompleted ? '1px solid rgba(34,197,94,0.3)' : isCurrentActive ? '1px solid rgba(0,240,255,0.5)' : '1px solid rgba(51,65,85,0.5)',
                                                    position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s'
                                                }}>
                                                    {isCurrentActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--cyan)' }}></div>}
                                                    <p style={{ color: isCompleted ? '#22c55e' : isCurrentActive ? 'var(--cyan)' : '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                                        {t?.modulePrefix || "Module"} {index + 1} {isCurrentActive ? `• ${t?.inProgress || "In Progress"}` : isLocked ? `• ${t?.locked || "Locked"}` : `• ${t?.completed || "Completed"}`}
                                                    </p>
                                                    <p style={{ color: isLocked ? '#94a3b8' : '#fff', fontSize: '1.125rem', fontWeight: isCurrentActive ? 700 : 500, margin: 0 }}>{mod.title}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="dashboard-side-col">
                        {/* Streak Card */}
                        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 240, 255, 0.3)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.6)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)'; }}>
                            <div style={{ position: 'absolute', right: '-16px', top: '-16px', width: '96px', height: '96px', background: 'rgba(255,107,0,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(255,107,0,0.2)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-2.28 0-3-4.5-3-4.5M10.74 3c4.56.24 7 4.12 7 7.76-.02 4.08-3.32 7.24-7.44 7.24-4.52 0-7.3-3.07-7.3-7.24.01-4 3.33-7.2 7.74-7.76z"></path></svg>
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t?.currentStreak || "Current Streak"}</p>
                            </div>
                            <p style={{ color: '#f1f5f9', fontSize: '2.5rem', fontWeight: 900, margin: 0, marginTop: '8px' }}>{currentStreak} <span style={{ fontSize: '1.25rem', fontWeight: 500, color: '#94a3b8' }}>{t?.days || "Days"}</span></p>
                        </div>

                        {/* Modules Done Card */}
                        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 240, 255, 0.3)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.6)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)'; }}>
                            <div style={{ position: 'absolute', right: '-16px', top: '-16px', width: '96px', height: '96px', background: 'rgba(255,215,0,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(255,215,0,0.2)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t?.modulesDone || "Modules Done"}</p>
                            </div>
                            <p style={{ color: '#f1f5f9', fontSize: '2.5rem', fontWeight: 900, margin: 0, marginTop: '8px' }}>{completedModules.length}</p>
                        </div>

                        {/* Total Tests Attempted Card */}
                        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 255, 136, 0.3)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.6)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)'; }}>
                            <div style={{ position: 'absolute', right: '-16px', top: '-16px', width: '96px', height: '96px', background: 'rgba(0,255,136,0.08)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,255,136,0.2)' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Tests Attempted</p>
                            </div>
                            <p style={{ color: '#00ff88', fontSize: '2.5rem', fontWeight: 900, margin: 0, marginTop: '8px' }}>{testResults.length}</p>
                        </div>

                        {/* Doubts Solved Card */}
                        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(180, 0, 255, 0.3)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(180, 0, 255, 0.6)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(180, 0, 255, 0.3)'; }}>
                            <div style={{ position: 'absolute', right: '-16px', top: '-16px', width: '96px', height: '96px', background: 'rgba(180,0,255,0.08)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(180,0,255,0.1)', border: '1px solid rgba(180,0,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(180,0,255,0.2)' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b400ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Doubts Solved</p>
                            </div>
                            <p style={{ color: '#b400ff', fontSize: '2.5rem', fontWeight: 900, margin: 0, marginTop: '8px' }}>{doubtsSolved}</p>
                        </div>

                        {/* System Load */}
                        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', margin: 0 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                                {t?.systemLoad || "System Load"}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                    <span>NEURAL_CAPACITY</span>
                                    <span style={{ color: 'var(--cyan)' }}>78%</span>
                                </div>
                                <div style={{ width: '100%', background: 'rgba(0,0,0,0.5)', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ background: 'var(--cyan)', height: '100%', width: '78%' }}></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main >
        );
    };

    return (
        <div className="dashboard-grid">
            {/* Left Sidebar Menu */}
            <aside className="sidebar">
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`sidebar-link ${activeTab === '/dashboard' ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        {t?.dashboard || "Dashboard"}
                    </Link>
                    <Link to="/dashboard/modules" className={`sidebar-link ${activeTab === '/dashboard/modules' ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                        {t?.modules || "Modules"}
                    </Link>
                    <Link to="/dashboard/tests" className={`sidebar-link ${activeTab === '/dashboard/tests' ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        {t?.testsResults || "Tests / Results"}
                    </Link>
                    <Link to="/analytics" className={`sidebar-link ${activeTab === '/analytics' ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        {t?.analytics || "Analytics"}
                    </Link>
                    <Link to="/roadmap" className={`sidebar-link ${activeTab === '/roadmap' ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                        AI Roadmap
                    </Link>
                    <Link to="/coding" className={`sidebar-link ${activeTab === '/coding' ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                        </svg>
                        Code Lab
                    </Link>
                    <Link to="/charts" className={`sidebar-link ${activeTab === '/charts' ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                        Charts
                    </Link>
                </nav>

                <div className="pro-learner-box">
                    <div className="pro-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                    </div>
                    <h4>{t?.proLearner || "Pro Learner"}</h4>
                    <p>{t?.unlockPro || "Unlock advanced AI tools"}</p>
                    <button className="upgrade-btn" onClick={() => navigate('/pricing')}>{t?.upgrade || "Upgrade ₹299/mo"}</button>
                </div>

                <div className="sidebar-footer">
                    <Link to="/settings" className={`settings-btn ${activeTab === '/settings' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: activeTab === '/settings' ? 'var(--cyan)' : undefined }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        {t?.settings || "Settings"}
                    </Link>
                </div>
            </aside>

            {renderMainContent()}

            {/* Right Sidebar - Study Tasks */}
            <aside className="task-sidebar">
                <div className="task-header">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: '#ff8a00' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        {t?.studyTasks || "My Study Tasks"}
                    </h3>
                    <button className="add-task-btn" onClick={() => setShowTaskInput(v => !v)} title="Add Task"
                        style={{ background: showTaskInput ? 'rgba(0,240,255,0.15)' : undefined, color: showTaskInput ? 'var(--cyan)' : undefined, transform: showTaskInput ? 'rotate(45deg)' : 'rotate(0)', transition: 'all 0.3s' }}>+</button>
                </div>

                {/* Add task input */}
                {showTaskInput && (
                    <div style={{ padding: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                            autoFocus
                            value={newTaskText}
                            onChange={e => setNewTaskText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') { setShowTaskInput(false); setNewTaskText(''); } }}
                            placeholder="What do you need to study?"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '10px', padding: '10px 12px', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleAddTask} style={{ flex: 1, background: 'linear-gradient(135deg, var(--cyan), #00bfff)', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Add Task</button>
                            <button onClick={() => { setShowTaskInput(false); setNewTaskText(''); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                        </div>
                    </div>
                )}

                <div className="task-list">
                    {tasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>No tasks yet. Hit <strong style={{ color: 'var(--cyan)' }}>+</strong> to add one!</p>
                        </div>
                    )}
                    {tasks.map(task => (
                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <div className="task-top">
                                <div className="task-content">
                                    <h4>{task.text}</h4>
                                    {!task.completed && task.createdAt && (
                                        <div style={{ marginTop: '8px' }}>
                                            <span className="task-tag" style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.15)', color: 'var(--cyan)', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                                📅 {task.createdAt}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    className="task-btn task-btn-complete"
                                    onClick={() => handleToggleTask(task.id)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        {task.completed ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="10" />}
                                    </svg>
                                    {task.completed ? "Undo" : "Complete"}
                                </button>
                                <button
                                    className="task-btn task-btn-delete"
                                    onClick={() => handleDeleteTask(task.id)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="task-footer">
                    <span>{pendingCount} task{pendingCount !== 1 ? 's' : ''} remaining</span>
                    {tasks.some(t => t.completed) && (
                        <button className="clear-completed" onClick={handleClearCompleted}>Clear done</button>
                    )}
                </div>
            </aside>
        </div>
    );
}
