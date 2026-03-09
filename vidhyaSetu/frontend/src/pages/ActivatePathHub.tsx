import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Target, Zap, Clock, ShieldCheck, ChevronRight, Activity, Cpu } from 'lucide-react';

interface Module {
    id: number;
    title: string;
}

export function ActivatePathHub({
    subject,
    modules,
    completedModules,
    onStartModule,
    t,
    language
}: {
    subject: string,
    modules: Module[],
    completedModules: number[],
    onStartModule: (id: number) => void,
    t?: any,
    language?: any
}) {
    const navigate = useNavigate();

    // AI Constellation Logic: Generate organic positions for nodes
    const stellarNodes = useMemo(() => {
        return modules.map((m, i) => {
            // Spiral-ish organic layout
            const angle = (i * 0.8) + (Math.random() * 0.2);
            const radius = 15 + (i * 8);
            return {
                ...m,
                completed: completedModules.includes(m.id),
                active: i === completedModules.length, // Next one to do
                x: 50 + Math.cos(angle) * radius,
                y: 50 + Math.sin(angle) * (radius * 0.7) // Squished for wide screens
            };
        });
    }, [modules, completedModules]);

    return (
        <div className="path-hub-container" style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden', background: '#020617' }}>

            {/* Immersive Background */}
            <div className="stellar-background">
                <div className="star-layer fast"></div>
                <div className="star-layer slow"></div>
                <div className="nebula-glow" style={{ top: '10%', left: '20%' }}></div>
                <div className="nebula-glow" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)' }}></div>
            </div>

            <main style={{ position: 'relative', zIndex: 10, padding: '40px', maxWidth: '1600px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>

                {/* HUD Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="animate-fade-in-up">
                        <button
                            onClick={() => navigate('/analytics')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', marginBottom: '16px', fontSize: '0.8rem', fontWeight: 700,
                                padding: '8px 16px', borderRadius: '12px', transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        >
                            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                            SYS_RETURN_ANALYTICS
                        </button>
                        <h1 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>
                            NEURAL <span style={{ color: 'var(--cyan)', textShadow: '0 0 30px rgba(0,240,255,0.4)' }}>PATH</span> HUB
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                            <div style={{ padding: '4px 12px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '20px', color: 'var(--cyan)', fontSize: '0.75rem', fontWeight: 800 }}>LIVE_UPLINK</div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>SUBJECT: <span style={{ color: '#f1f5f9' }}>{subject?.toUpperCase() || "CORE_LOGIC"}</span></p>
                        </div>
                    </div>

                    <div className="hud-panel animate-fade-in-up delay-100" style={{ display: 'flex', gap: '32px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Projected Success</p>
                            <p style={{ color: '#00ff80', fontSize: '1.8rem', fontWeight: 900 }}>88.4<span style={{ fontSize: '1rem' }}>%</span></p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Neural Expansion</p>
                            <p style={{ color: 'var(--magenta)', fontSize: '1.8rem', fontWeight: 900 }}>+12.5<span style={{ fontSize: '1rem' }}>%</span></p>
                        </div>
                    </div>
                </div>

                {/* The Stellar Map Viewport */}
                <div style={{ flex: 1, position: 'relative', marginTop: '40px', cursor: 'grab' }}>

                    {/* SVG Quantum Trails Layer */}
                    <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                        <defs>
                            <linearGradient id="quantum-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--cyan)" />
                                <stop offset="100%" stopColor="var(--magenta)" />
                            </linearGradient>
                        </defs>
                        {stellarNodes.map((node, i) => {
                            if (i === stellarNodes.length - 1) return null;
                            const nextNode = stellarNodes[i + 1];
                            return (
                                <line
                                    key={i}
                                    x1={`${node.x}%`} y1={`${node.y}%`}
                                    x2={`${nextNode.x}%`} y2={`${nextNode.y}%`}
                                    className={node.completed && nextNode.completed ? "" : "quantum-trail"}
                                    stroke={node.completed && nextNode.completed ? '#00ff80' : 'rgba(255,255,255,0.1)'}
                                    strokeWidth={node.active ? "3" : "1.5"}
                                />
                            )
                        })}
                    </svg>

                    {/* Interactive Star Nodes */}
                    {stellarNodes.map((node) => (
                        <div
                            key={node.id}
                            className={`stellar-node ${node.completed ? 'completed' : ''} ${node.active ? 'active' : ''} animate-fade-in-up`}
                            style={{
                                left: `${node.x}%`,
                                top: `${node.y}%`,
                                transform: `translate(-50%, -50%)`,
                                transitionDelay: `${node.id * 100}ms`
                            }}
                            onClick={() => {
                                console.log("Initializing Stellar Module:", node.id);
                                onStartModule(node.id);
                            }}
                        >
                            {node.completed ? <ShieldCheck size={32} color="#00ff80" /> : <Sparkles size={32} />}
                            <div className="stellar-label">
                                {node.title}
                            </div>

                            {/* Orbital Indicator for Active Node */}
                            {node.active && (
                                <div style={{ position: 'absolute', width: '140%', height: '140%', border: '1px solid var(--cyan)', borderRadius: '50%', animation: 'neural-orbit 4s infinite linear' }}>
                                    <div style={{ position: 'absolute', top: 0, left: '50%', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff' }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* HUD Bottom Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '20px' }}>

                    <div className="hud-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,255,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={24} color="#00ff80" />
                        </div>
                        <div>
                            <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.9rem' }}>82% COGNITIVE_UP</p>
                            <p style={{ color: '#64748b', fontSize: '0.7rem' }}>Syncing with Neural Core</p>
                        </div>
                    </div>

                    <div className="hud-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target size={24} color="var(--cyan)" />
                        </div>
                        <div>
                            <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.9rem' }}>STELLAR_FOCUS</p>
                            <p style={{ color: '#64748b', fontSize: '0.7rem' }}>Module_{stellarNodes.find(n => n.active)?.id || "0"}</p>
                        </div>
                    </div>

                    <div className="hud-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(180,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={24} color="var(--magenta)" />
                        </div>
                        <div>
                            <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.9rem' }}>1.5x NEURAL_XP</p>
                            <p style={{ color: '#64748b', fontSize: '0.7rem' }}>Active Multiplier</p>
                        </div>
                    </div>

                    <div className="hud-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} color="#94a3b8" />
                        </div>
                        <div>
                            <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.9rem' }}>ETA: MAR 12</p>
                            <p style={{ color: '#64748b', fontSize: '0.7rem' }}>Predictive Completion</p>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
