import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingsPageProps {
    t?: any;
    studentProfile?: { name: string; age: number; grade: string } | null;
    onSaveProfile?: (profile: { name: string; age: number; grade: string }) => void;
    language?: any;
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div onClick={onChange} style={{ width: '48px', height: '26px', borderRadius: '999px', background: checked ? 'var(--cyan)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', boxShadow: checked ? '0 0 10px rgba(0,240,255,0.4)' : 'none' }}>
        <div style={{ position: 'absolute', top: '3px', left: checked ? '24px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
    </div>
);

export function SettingsPage({ studentProfile, onSaveProfile, t, language }: SettingsPageProps) {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('profile');
    const [name, setName] = useState(studentProfile?.name || '');
    const [age, setAge] = useState(String(studentProfile?.age || ''));
    const [grade, setGrade] = useState(studentProfile?.grade || '');
    const [saved, setSaved] = useState(false);

    const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true, test: true });
    const [appearance, setAppearance] = useState({ darkMode: true, compactView: false, animations: true });

    const handleSave = () => {
        if (onSaveProfile && name && age && grade) {
            onSaveProfile({ name, age: Number(age), grade });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const sections = [
        { id: 'profile', icon: '👤', label: 'Profile' },
        { id: 'notifications', icon: '🔔', label: 'Notifications' },
        { id: 'appearance', icon: '🎨', label: 'Appearance' },
        { id: 'security', icon: '🔒', label: 'Security' },
        { id: 'about', icon: 'ℹ️', label: 'About' },
    ];

    const inputStyle: React.CSSProperties = {
        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '1rem', outline: 'none',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: '1100px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 18px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginBottom: '32px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>
                Back
            </button>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Settings</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>Manage your account, preferences, and security.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
                {/* Sidebar */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sections.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                            background: activeSection === s.id ? 'rgba(0,240,255,0.08)' : 'transparent',
                            border: activeSection === s.id ? '1px solid rgba(0,240,255,0.2)' : '1px solid transparent',
                            color: activeSection === s.id ? 'var(--cyan)' : '#94a3b8', cursor: 'pointer', fontWeight: 600,
                            fontSize: '0.95rem', textAlign: 'left', transition: 'all 0.2s',
                        }} onMouseOver={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseOut={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'transparent'; }}>
                            <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '40px', minHeight: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    {/* Profile */}
                    {activeSection === 'profile' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ borderLeft: '4px solid var(--cyan)', paddingLeft: '20px' }}>
                                <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Profile Settings</h2>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Manage your personal identity and learning preferences.</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--magenta))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#fff', boxShadow: '0 0 30px rgba(0,240,255,0.2)', position: 'relative', zIndex: 2 }}>
                                        {name ? name[0].toUpperCase() : '?'}
                                    </div>
                                    <div style={{ position: 'absolute', inset: '-5px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--magenta))', opacity: 0.3, filter: 'blur(8px)', zIndex: 1, animation: 'pulseGlow 3s infinite' }}></div>
                                </div>
                                <div>
                                    <p style={{ color: '#fff', fontWeight: 800, margin: '0 0 6px 0', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>{name || 'Student Name'}</p>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ padding: '2px 8px', background: 'rgba(0,240,255,0.1)', color: 'var(--cyan)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{grade || 'Grade Not Set'}</span>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#475569' }}></span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Age {age || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ gridColumn: '1 / -1' }} className="modal-field">
                                    <label className="modal-label">Full Name</label>
                                    <input className="modal-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label">Age</label>
                                    <input className="modal-input" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" type="number" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label">Grade / Level</label>
                                    <select className="modal-input" value={grade} onChange={e => setGrade(e.target.value)} style={{ cursor: 'pointer' }}>
                                        <option value="" disabled>Select grade</option>
                                        {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'College Degree', 'Post Graduate', 'Professional'].map(g => (
                                            <option key={g} value={g} style={{ background: '#0f172a', color: '#fff' }}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                <button onClick={handleSave} className="modal-submit-btn" style={{ flex: 1, height: '56px', fontSize: '1.1rem' }}>
                                    {saved ? '✓ Profile Updated' : 'Save Changes'}
                                </button>
                                <button onClick={() => navigate(-1)} style={{ padding: '0 32px', height: '56px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeSection === 'notifications' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0' }}>Notification Preferences</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Manage when and how you receive notifications.</p>
                            </div>
                            {[
                                { key: 'email', title: 'Email Notifications', desc: 'Get progress reports and updates via email' },
                                { key: 'push', title: 'Push Notifications', desc: 'Browser push alerts for new modules and tests' },
                                { key: 'weekly', title: 'Weekly Summary', desc: 'Receive a weekly digest of your learning progress' },
                                { key: 'test', title: 'Test Reminders', desc: 'Reminders to complete pending module tests' },
                            ].map(n => (
                                <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <p style={{ color: '#e2e8f0', fontWeight: 600, margin: '0 0 4px 0' }}>{n.title}</p>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{n.desc}</p>
                                    </div>
                                    <Toggle checked={notifications[n.key as keyof typeof notifications]} onChange={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notifications] }))} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Appearance */}
                    {activeSection === 'appearance' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0' }}>Appearance</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Personalize how the app looks and behaves.</p>
                            </div>
                            {[
                                { key: 'darkMode', title: 'Dark Mode', desc: 'Use dark theme for better night-time viewing' },
                                { key: 'compactView', title: 'Compact View', desc: 'Reduce spacing for a denser information layout' },
                                { key: 'animations', title: 'Enable Animations', desc: 'Smooth transitions and hover effects' },
                            ].map(a => (
                                <div key={a.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <p style={{ color: '#e2e8f0', fontWeight: 600, margin: '0 0 4px 0' }}>{a.title}</p>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{a.desc}</p>
                                    </div>
                                    <Toggle checked={appearance[a.key as keyof typeof appearance]} onChange={() => setAppearance(prev => ({ ...prev, [a.key]: !prev[a.key as keyof typeof appearance] }))} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Security */}
                    {activeSection === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0' }}>Security</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Manage your account security and privacy.</p>
                            </div>
                            <div style={{ padding: '24px', background: 'rgba(0,255,170,0.04)', border: '1px solid rgba(0,255,170,0.15)', borderRadius: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🔐</span>
                                    <p style={{ color: '#00ffaa', fontWeight: 700, margin: 0 }}>Account Secured</p>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Your account data is stored locally on this device. No server accounts are currently linked.</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#f87171', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s', width: '100%' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                                    <span>🗑️</span> Clear All Local Data
                                </button>
                            </div>
                        </div>
                    )}

                    {/* About */}
                    {activeSection === 'about' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0' }}>About Vidya-Setu</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Platform information and attribution.</p>
                            </div>
                            {[
                                { label: 'Version', val: '1.0.0' },
                                { label: 'AI Model', val: 'Amazon Bedrock (AWS)' },
                                { label: 'Infrastructure', val: 'AWS Cloud' },
                                { label: 'Frontend', val: 'React + TypeScript + Vite' },
                                { label: 'Backend', val: 'Python FastAPI' },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ color: '#94a3b8' }}>{row.label}</span>
                                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{row.val}</span>
                                </div>
                            ))}
                            <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>Made with ❤️ for Bharat • © 2026 Vidya-Setu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
