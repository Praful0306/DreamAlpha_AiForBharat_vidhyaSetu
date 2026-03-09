import { useState, type ReactNode } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import type { Language } from "../translations";
import { useAuth } from "../contexts/AuthContext";

interface AppLayoutProps {
    children: ReactNode;
    language: Language;
    setLanguage: (lang: Language) => void;
    studentProfile: { name: string; age: number; grade: string } | null;
    onEditProfile: () => void;
}

const NAV_LINKS = [
    {
        to: "/dashboard",
        label: "Dashboard",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        to: "/dashboard/modules",
        label: "Modules",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
        ),
    },
    {
        to: "/dashboard/tests",
        label: "Tests / Results",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    },
    {
        to: "/analytics",
        label: "Analytics",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
    },
    {
        to: "/roadmap",
        label: "AI Roadmap",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
        ),
    },
    {
        to: "/coding",
        label: "Code Lab",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
        ),
    },
    {
        to: "/charts",
        label: "Charts",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
        ),
    },
    {
        to: "/settings",
        label: "Settings",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
];

export function AppLayout({ children, language, setLanguage, studentProfile, onEditProfile }: AppLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const activeTab = location.pathname;

    const langLabel = language === 'en' ? 'English' : language === 'kn' ? 'ಕನ್ನಡ' : 'हिंदी';

    return (
        <div className="app-shell">
            {/* ── Topbar ─────────────────────────────────────────────────── */}
            <nav className="topbar">
                {/* LEFT: hamburger (mobile) + logo */}
                <div className="topbar-left-group">
                    <button
                        className="hamburger-btn"
                        onClick={() => setDrawerOpen(v => !v)}
                        aria-label="Toggle navigation"
                        aria-expanded={drawerOpen}
                    >
                        {drawerOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        )}
                    </button>

                    <div className="topbar-left" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <div className="logo-box">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            </svg>
                        </div>
                        <div className="logo-text">
                            <h1 className="logo-title">Vidya-Setu</h1>
                            <span className="logo-subtitle desktop-only">AI COMMAND CENTER</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: all in one single nowrap flex row */}
                <div className="topbar-right">
                    {/* Desktop: "Hello, name" greeting */}
                    {studentProfile && (
                        <div className="topbar-profile-info desktop-only" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="status-indicator" />
                                <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>
                                    Hello, <span style={{ background: 'linear-gradient(135deg, #00f0ff, #b400ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{studentProfile.name}</span>! 👋
                                </span>
                            </div>
                            <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', paddingLeft: '18px' }}>
                                I can help you learn anything · {studentProfile.grade}
                            </span>
                        </div>
                    )}

                    {/* Desktop: Home button */}
                    <button className="lang-btn exit-btn desktop-only" onClick={() => navigate('/')} title="Back to Landing Page">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Home
                    </button>

                    {/* Desktop: Sign Out button */}
                    <button className="lang-btn exit-btn desktop-only" onClick={handleSignOut} title="Sign Out" style={{ color: '#f87171' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>

                    {/* Desktop: Language toggle buttons */}
                    <div className="lang-toggle desktop-only">
                        <span className="lang-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            {language === 'hi' ? 'भाषा' : 'LANGUAGE'}
                        </span>
                        <button className={`lang-btn ${language === 'en' ? 'active' : 'inactive'}`} onClick={() => setLanguage("en")}>English</button>
                        <button className={`lang-btn ${language === 'kn' ? 'active' : 'inactive'}`} onClick={() => setLanguage("kn")}>ಕನ್ನಡ</button>
                        <button className={`lang-btn ${language === 'hi' ? 'active' : 'inactive'}`} onClick={() => setLanguage("hi")}>हिंदी</button>
                    </div>

                    {/* Mobile/tablet: compact language select */}
                    <select
                        className="mobile-lang-select"
                        value={language}
                        onChange={e => setLanguage(e.target.value as Language)}
                        title="Select language"
                    >
                        <option value="en">🌐 EN</option>
                        <option value="kn">ಕ</option>
                        <option value="hi">हि</option>
                    </select>

                    {/* Edit Profile — icon only on mobile */}
                    {studentProfile && (
                        <button className="impressive-btn" onClick={onEditProfile} title="Edit Profile">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span className="edit-profile-text">Edit Profile</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* ── Mobile Nav Drawer ─────────────────────────────────────── */}
            {/* Overlay backdrop */}
            {drawerOpen && (
                <div
                    className="mobile-nav-overlay"
                    onClick={() => setDrawerOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Drawer panel */}
            <aside className={`mobile-nav-drawer ${drawerOpen ? 'open' : ''}`}>
                <div className="mobile-drawer-header">
                    <div className="logo-box" style={{ width: 32, height: 32 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                    </div>
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem' }}>Vidya-Setu</span>
                </div>

                {studentProfile && (
                    <div className="mobile-drawer-profile">
                        <div className="status-indicator" style={{ display: 'inline-block', marginRight: 8 }} />
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{studentProfile.name}</span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: 2 }}>{studentProfile.grade}</span>
                    </div>
                )}

                <nav className="mobile-drawer-nav">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`mobile-drawer-link ${activeTab === link.to ? 'active' : ''}`}
                            onClick={() => setDrawerOpen(false)}
                        >
                            <span className="mobile-drawer-icon">{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mobile-drawer-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', padding: '10px 0' }}
                        onClick={() => { setDrawerOpen(false); navigate('/'); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Back to Home
                    </button>
                    <button
                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.9rem', padding: '10px 0' }}
                        onClick={() => { setDrawerOpen(false); handleSignOut(); }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {children}
        </div>
    );
}
