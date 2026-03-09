import { BookOpenCheck, ChevronRight, Lock } from "lucide-react";

export interface ModuleSummary {
    id: number;
    title: string;
    description: string;
}

interface CourseDashboardProps {
    subject: string;
    modules: ModuleSummary[];
    completedModules: number[];
    onStartModule: (moduleId: number) => void;
    t: any;
}

export function CourseDashboard({ subject, modules, completedModules, onStartModule, t }: CourseDashboardProps) {
    return (
        <div style={{ width: '100%', maxWidth: '768px', margin: '24px auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{
                backgroundColor: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '16px', color: '#10b981', boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.05)' }}>
                        <BookOpenCheck size={32} style={{ strokeWidth: 1.5 }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                            {subject}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                            {t?.learningJourney || "Your personalized learning journey"}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {modules.map((mod, index) => {
                    // Module is unlocked if it's the first one, or if the PREVIOUS one is completed.
                    const isUnlocked = index === 0 || completedModules.includes(modules[index - 1].id) || completedModules.includes(mod.id);
                    const isCompleted = completedModules.includes(mod.id);

                    const baseStyle: React.CSSProperties = {
                        position: 'relative',
                        backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.05)' : isUnlocked ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : isUnlocked ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '20px',
                        cursor: isUnlocked ? 'pointer' : 'default',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: isUnlocked ? 1 : 0.5,
                        boxShadow: isUnlocked ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                    };

                    const hoverStyle = isUnlocked && !isCompleted ? {
                        transform: 'translateY(-4px)',
                        borderColor: 'rgba(56, 189, 248, 0.5)',
                        boxShadow: '0 12px 24px -10px rgba(56, 189, 248, 0.2)'
                    } : {};

                    return (
                        <div
                            key={mod.id}
                            style={{ ...baseStyle }}
                            onClick={() => isUnlocked ? onStartModule(mod.id) : null}
                            onMouseEnter={(e) => {
                                if (isUnlocked && !isCompleted) {
                                    Object.assign(e.currentTarget.style, hoverStyle);
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isUnlocked && !isCompleted) {
                                    e.currentTarget.style.transform = baseStyle.transform || 'none';
                                    e.currentTarget.style.borderColor = baseStyle.borderColor || 'transparent';
                                    e.currentTarget.style.boxShadow = baseStyle.boxShadow || 'none';
                                }
                            }}
                        >
                            <div style={{
                                flexShrink: 0,
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                fontWeight: '700',
                                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : isUnlocked ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                color: isCompleted ? '#34d399' : isUnlocked ? '#38bdf8' : '#64748b'
                            }}>
                                {isCompleted ? '✓' : mod.id}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: isUnlocked ? '#f1f5f9' : '#94a3b8', margin: '0 0 6px 0' }}>
                                    {mod.title}
                                </h3>
                                <p style={{ fontSize: '14px', color: isUnlocked ? '#94a3b8' : '#64748b', margin: 0, lineHeight: 1.5 }}>
                                    {mod.description}
                                </p>
                            </div>

                            <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                                {!isUnlocked ? (
                                    <Lock color="#475569" size={24} />
                                ) : (
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: isCompleted ? 'transparent' : 'rgba(56, 189, 248, 0.1)',
                                        color: isCompleted ? '#34d399' : '#38bdf8'
                                    }}>
                                        <ChevronRight size={24} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {completedModules.length === modules.length && modules.length > 0 && (
                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    padding: '32px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.1)',
                    animation: 'bounce 2s infinite'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>
                        <span style={{ marginRight: '12px' }}>🎉</span>
                        {t?.congratulations || "Congratulations! Course Completed."}
                        <span style={{ marginLeft: '12px' }}>🎉</span>
                    </h2>
                </div>
            )}
        </div>
    );
}
