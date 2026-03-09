import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import type { Language } from '../translations';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
    language?: Language;
    setLanguage?: (lang: Language) => void;
    t?: any;
}

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

export function LandingPage({ language = "en", setLanguage, t }: LandingPageProps) {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();

    const handleCTAClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/auth');
        }
    };

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        const targetId = href.replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
            const navOffset = 90; // Adjust for fixed navbar
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - navOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="landing-container" style={{ background: '#06060a', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Animated background grid */}
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,240,255,0.04) 1px, transparent 0)', backgroundSize: '40px 40px', zIndex: 0, pointerEvents: 'none' }} />

            {/* Top Navigation — Premium & Responsive */}
            <nav className="glass-card landing-nav">
                {/* Logo */}
                <div className="nav-left" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="logo-box">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="url(#navGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <defs><linearGradient id="navGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00f0ff" /><stop offset="100%" stopColor="#b400ff" /></linearGradient></defs>
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="logo-title">Vidya<span className="logo-gradient">-Setu</span></span>
                        </div>
                        <div className="logo-subtitle-container">
                            <div className="logo-pulse-dot" />
                            <span className="logo-subtitle">AI Knowledge Engine</span>
                        </div>
                    </div>
                </div>

                {/* Center nav links (Hidden on mobile unless opened) */}
                <ul className={`nav-center ${isMobileMenuOpen ? 'open' : ''}`}>
                    {[
                        { label: t?.home || 'Home', href: '#hero' },
                        { label: t?.features || 'Features', href: '#features' },
                        { label: t?.aboutUs || 'About', href: '#about' },
                        { label: t?.ecosystem || 'Ecosystem', href: '#ecosystem' },
                        { label: 'Pricing', href: '/pricing', isRoute: true },
                    ].map((item, i) => (
                        <li key={i}>
                            {item.isRoute ? (
                                <button className="nav-link-btn" onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }}>
                                    {item.label}
                                </button>
                            ) : (
                                <a className="nav-link" href={item.href} onClick={(e) => handleScrollTo(e, item.href)}>
                                    {item.label}
                                </a>
                            )}
                        </li>
                    ))}
                    <li className="mobile-only-lang">
                        <div className="lang-switcher">
                            {[
                                { code: 'en' as Language, label: 'EN' },
                                { code: 'kn' as Language, label: 'ಕನ್ನಡ' },
                                { code: 'hi' as Language, label: 'हिंदी' },
                            ].map(l => (
                                <button key={l.code} onClick={() => setLanguage?.(l.code)} className={`lang-opt ${language === l.code ? 'active' : ''}`}>
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </li>
                </ul>

                {/* Right side actions - Always visible single line */}
                <div className="nav-right">
                    {/* Language switcher - Desktop only */}
                    <div className="lang-switcher desktop-lang">
                        {[
                            { code: 'en' as Language, label: 'EN' },
                            { code: 'kn' as Language, label: 'ಕನ್ನಡ' },
                            { code: 'hi' as Language, label: 'हिंदी' },
                        ].map(l => (
                            <button key={l.code} onClick={() => setLanguage?.(l.code)} className={`lang-opt ${language === l.code ? 'active' : ''}`}>
                                {l.label}
                            </button>
                        ))}
                    </div>

                    {/* Actions container for mobile row */}
                    <div className="nav-actions-row">
                        <button className="login-btn compact" onClick={handleCTAClick}>
                            Log In
                        </button>

                        <button className="get-started-btn glowing-btn" onClick={handleCTAClick}>
                            <span className="text-full">Start Free →</span>
                        </button>

                        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={26} color="#00f0ff" /> : <Menu size={26} color="#00f0ff" />}
                        </button>
                    </div>
                </div>
            </nav>


            {/* ===== HERO SECTION ===== */}
            <section id="hero" className="hero-section" style={{ paddingTop: '180px', paddingBottom: '100px', position: 'relative', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0, transparent 70%)', pointerEvents: 'none' }} />
                <div className="hero-card animate-fade-in-up" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                    <div className="badge" style={{ animation: 'pulse 2s infinite' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        <span>AI-POWERED LEARNING PLATFORM FOR BHARAT</span>
                    </div>
                    <h1 className="hero-headline gradient-text-animate" style={{ fontSize: '5.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                        Master Any Subject<br />with AI
                    </h1>
                    <p className="hero-subheadline" style={{ fontSize: '1.35rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: '650px' }}>
                        {t?.landingHeroSubtitle || "Vidya-Setu bridges the gap between rural India and world-class education. Generate personalized modules, take smart tests, and track your growth — all powered by AI."}
                    </p>
                    <div className="hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="primary-enter-btn animate-pulse-glow" onClick={handleCTAClick}>
                            Start Learning for Free
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px' }}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontWeight: 600, fontSize: '1.1rem', padding: '15px 28px', borderRadius: '30px', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseOver={e => Object.assign(e.currentTarget.style, { borderColor: 'rgba(0,240,255,0.5)', color: '#00f0ff' })} onMouseOut={e => Object.assign(e.currentTarget.style, { borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0' })}>
                            Explore Features
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', marginTop: '16px', color: '#64748b', fontSize: '0.875rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00ffaa' }}>✓</span> Free to Start</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00ffaa' }}>✓</span> AI-Powered</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00ffaa' }}>✓</span> Multilingual Support</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00ffaa' }}>✓</span> Works Offline</span>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section id="features" style={{ padding: '120px 20px', position: 'relative', zIndex: 5 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <div className="badge" style={{ margin: '0 auto 20px auto' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            <span>FEATURES</span>
                        </div>
                        <h2 className="gradient-text-animate" style={{ fontSize: '3.8rem', fontWeight: 900, margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>
                            Everything You Need to Excel
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
                            Built from the ground up for Indian students, powered by the latest AI to give you a world-class education experience.
                        </p>
                    </div>

                    <div className="feature-grid animate-fade-in-up" id="f-grid">
                        {[
                            { icon: '📚', color: 'purple-icon', iconColor: 'var(--magenta)', title: 'AI Module Generation', desc: 'Instantly generate structured, personalized curricula on any topic. Our AI breaks down complex subjects into digestible modules tailored exactly to your level and goals.', border: 'rgba(180,0,255,0.2)' },
                            { icon: '✅', color: 'mint-icon', iconColor: '#00ffaa', title: 'Smart Assessments', desc: 'Take adaptive quizzes that identify your weak spots. With 3 targeted questions per module — from basic to advanced — you master material efficiently and retain it longer.', border: 'rgba(0,255,170,0.2)' },
                            { icon: '📊', color: 'blue-icon', iconColor: 'var(--cyan)', title: 'Real-time Analytics', desc: 'Track your entire learning journey with a powerful dashboard showing scores, completion rates, and personalized performance insights that guide your next steps.', border: 'rgba(0,240,255,0.2)' },
                            { icon: '🤖', color: 'purple-icon', iconColor: 'var(--magenta)', title: 'AI Chatbot Tutor', desc: 'Stuck on a concept? Our AI tutor is always available to answer your questions in plain language. It even provides analogies and mini-quizzes to reinforce your understanding.', border: 'rgba(180,0,255,0.2)' },
                            { icon: '🌐', color: 'mint-icon', iconColor: '#00ffaa', title: 'Multilingual Support', desc: 'Learn in the language you are most comfortable with. Vidya-Setu supports English, Hindi, and Kannada with full UI and content translations.', border: 'rgba(0,255,170,0.2)' },
                            { icon: '📱', color: 'blue-icon', iconColor: 'var(--cyan)', title: 'Works Offline', desc: 'In areas with poor connectivity, Vidya-Setu caches your course data locally so you can study even without internet. Your progress syncs when you reconnect.', border: 'rgba(0,240,255,0.2)' },
                        ].map((f, i) => (
                            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className={`feature-icon ${f.color}`} style={{ fontSize: '1.75rem' }}>{f.icon}</div>
                                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '20px 0 12px 0' }}>{f.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>{f.desc}</p>
                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${f.border}`, color: '#00f0ff', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleCTAClick}>
                                    Learn More <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== ABOUT US SECTION ===== */}
            <section id="about" className="about-section" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,240,255,0.02), transparent)' }}>
                <div className="about-header">
                    <div className="badge" style={{ margin: '0 auto 20px auto' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                        <span>ABOUT US</span>
                    </div>
                    <h2>Built for Bharat,<br />Powered by AI</h2>
                    <p>Vidya-Setu was born from a simple belief: every student in India deserves access to world-class, personalized education — regardless of where they live or what resources they have.</p>
                </div>

                <div className="about-grid">
                    <div className="about-content animate-fade-in-up">
                        <p className="about-text">
                            The name <strong style={{ color: '#fff' }}>Vidya-Setu</strong> means <em style={{ color: 'var(--cyan)' }}>"Bridge of Knowledge"</em> in Sanskrit. We are building that bridge — connecting rural and underserved students to the same AI-powered tools that top students in cities use every day.
                        </p>
                        <p className="about-text">
                            Our platform is built on AWS cloud infrastructure, using cutting-edge <strong style={{ color: '#fff' }}>Amazon Bedrock</strong> AI models to generate curriculum, assess knowledge, and provide intelligent tutoring at scale.
                        </p>
                        <div className="about-stats">
                            {[
                                { num: '10K+', label: 'Students Empowered', color: 'var(--cyan)' },
                                { num: '50+', label: 'Topics Available', color: '#00ffaa' },
                                { num: '3', label: 'Languages Supported', color: 'var(--magenta)' },
                                { num: '99%', label: 'Uptime on AWS', color: '#f59e0b' },
                            ].map((s, i) => (
                                <div key={i} className="stat-box">
                                    <p className="stat-number" style={{ background: `linear-gradient(135deg, ${s.color}, #3b82f6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.num}</p>
                                    <p className="stat-label">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="about-visual">
                        <div className="visual-sphere" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                            {['🇮🇳 Made for India', '🧠 AI Curriculum', '📡 AWS Powered', '🌐 Multilingual', '📱 Offline First'].map((tag, i) => (
                                <div key={i} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '999px', padding: '10px 24px', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: `float ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ECOSYSTEM SECTION ===== */}
            <section id="ecosystem" className="ecosystem-section">
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div className="badge" style={{ margin: '0 auto 20px auto' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M20.19 8.19a9 9 0 1 0 .01 7.62" /><path d="M21 3v5h-5" /></svg>
                        <span>OUR ECOSYSTEM</span>
                    </div>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '0 0 20px 0', background: 'linear-gradient(135deg, #fff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        A Complete Learning<br />Ecosystem
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
                        Every component of Vidya-Setu is designed to work together seamlessly, giving you the most effective and engaging learning experience possible.
                    </p>
                </div>

                <div className="ecosystem-container">
                    {/* Row 1 */}
                    <div className="eco-row animate-fade-in-up">
                        <div className="eco-text">
                            <span className="eco-badge">🎓 CURRICULUM ENGINE</span>
                            <h3>AI-Generated Custom Curricula</h3>
                            <p>Enter any topic — from "Quantum Physics" to "Business English" — and our AI instantly builds a structured course just for you, broken into progressive modules from beginner to advanced.</p>
                            <div className="eco-features">
                                {['Personalized to your age & grade', 'Structured from basic to advanced', 'Regenerate anytime with new angles', '3 focused questions per module'].map((f, i) => (
                                    <div key={i} className="eco-feature-item">
                                        <div className="eco-feature-icon"><CheckIcon /></div>
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="eco-visual">
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '12px', padding: '16px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                    <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: '8px' }}>📘 Module 1: Introduction to Python</div>
                                    <div style={{ color: '#94a3b8' }}>Variables, data types, and your first program.</div>
                                </div>
                                <div style={{ background: 'rgba(0,255,170,0.05)', border: '1px solid rgba(0,255,170,0.1)', borderRadius: '12px', padding: '16px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                    <div style={{ color: '#00ffaa', fontWeight: 700, marginBottom: '8px' }}>📗 Module 2: Control Flow</div>
                                    <div style={{ color: '#94a3b8' }}>If statements, loops, and functions.</div>
                                </div>
                                <div style={{ background: 'rgba(180,0,255,0.05)', border: '1px solid rgba(180,0,255,0.1)', borderRadius: '12px', padding: '16px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                    <div style={{ color: 'var(--magenta)', fontWeight: 700, marginBottom: '8px' }}>📙 Module 3: Advanced Topics</div>
                                    <div style={{ color: '#94a3b8' }}>Classes, decorators, and async programming.</div>
                                </div>
                                <div style={{ background: 'rgba(0,240,255,0.08)', borderRadius: '8px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>AI generating your next module...</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse 1.2s infinite', animationDelay: `${i * 0.2}s` }} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="eco-row reverse animate-fade-in-up">
                        <div className="eco-text">
                            <span className="eco-badge" style={{ background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.3)', color: '#00ffaa' }}>🧪 KNOWLEDGE CHECKS</span>
                            <h3>Adaptive Tests & Instant Feedback</h3>
                            <p>Each module comes with 3 smart, AI-crafted questions — multiple choice and short answer — that challenge you across different difficulty levels. Get instant, detailed feedback after every answer.</p>
                            <div className="eco-features">
                                {['MCQ and short-answer formats', 'Detailed answer explanations', 'Score tracking across all tests', 'Retry any test to improve your score'].map((f, i) => (
                                    <div key={i} className="eco-feature-item">
                                        <div className="eco-feature-icon" style={{ background: 'rgba(0,255,170,0.1)', color: '#00ffaa', border: '1px solid rgba(0,255,170,0.3)' }}><CheckIcon /></div>
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="eco-visual" style={{ borderColor: 'rgba(0,255,170,0.2)' }}>
                            <div style={{ width: '100%' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question 2 of 3</div>
                                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: '66%', background: '#00ffaa', borderRadius: '4px', boxShadow: '0 0 8px rgba(0,255,170,0.5)' }} />
                                    </div>
                                </div>
                                <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '20px', fontSize: '1rem' }}>What is the output of <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: '#00ffaa' }}>print(2 ** 10)</code>?</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {['512', '1024 ✓', '2048', '256'].map((opt, i) => (
                                        <div key={i} style={{ background: i === 1 ? 'rgba(0,255,170,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 1 ? 'rgba(0,255,170,0.4)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px', padding: '10px 16px', color: i === 1 ? '#00ffaa' : '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="eco-row animate-fade-in-up">
                        <div className="eco-text">
                            <span className="eco-badge" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', color: 'var(--cyan)' }}>📡 ANALYTICS DASHBOARD</span>
                            <h3>Track Your Progress with Live Analytics</h3>
                            <p>Vidya-Setu's analytics dashboard gives you a complete picture of your learning journey. See your average score, modules mastered, time spent learning, and personalized recommendations on what to study next.</p>
                            <div className="eco-features">
                                {['Average score across all tests', 'Modules mastered over time', 'Subject-wise performance breakdown', 'Personalized learning recommendations'].map((f, i) => (
                                    <div key={i} className="eco-feature-item">
                                        <div className="eco-feature-icon" style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,240,255,0.3)' }}><CheckIcon /></div>
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="eco-visual" style={{ borderColor: 'rgba(0,240,255,0.2)' }}>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    { label: 'Average Accuracy', val: '87%', color: 'var(--cyan)', pct: 87 },
                                    { label: 'Modules Mastered', val: '12 / 20', color: '#00ffaa', pct: 60 },
                                    { label: 'Tests Passed', val: '9 / 10', color: 'var(--magenta)', pct: 90 },
                                ].map((s, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{s.label}</span>
                                            <span style={{ color: s.color, fontWeight: 700 }}>{s.val}</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '999px', boxShadow: `0 0 10px ${s.color}` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section style={{ padding: '100px 20px', position: 'relative', zIndex: 5 }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.06) 0, transparent 70%)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '32px', padding: '80px 60px', backdropFilter: 'blur(12px)', boxShadow: '0 0 60px rgba(0,240,255,0.05)' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 20px 0', background: 'linear-gradient(135deg, #fff, #00f0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Start Your AI Learning<br />Journey Today
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: '40px', lineHeight: 1.6 }}>
                        Join thousands of students across India who are using Vidya-Setu to unlock their full potential — completely free.
                    </p>
                    <button className="primary-enter-btn" onClick={handleCTAClick} style={{ fontSize: '1.25rem', padding: '18px 40px' }}>
                        Begin Learning for Free 🚀
                    </button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="glass-footer">
                <div className="footer-glow" />
                <div className="footer-content">
                    {/* Brand */}
                    <div className="footer-brand">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'var(--cyan)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                            </div>
                            Vidya-Setu
                        </h2>
                        <p>Bridging the gap between rural India and world-class AI-powered education. Built with ❤️ for Bharat.</p>
                        <div className="social-links">
                            {[
                                { title: 'GitHub', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" /></svg> },
                                { title: 'Twitter', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                                { title: 'LinkedIn', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
                            ].map((s, i) => (
                                <a key={i} href="#" className="social-icon" title={s.title}>{s.icon}</a>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#ecosystem">Ecosystem</a></li>
                            <li><a href="#" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">API Reference</a></li>
                            <li><a href="#">Tutorials</a></li>
                            <li><a href="#">Blog</a></li>
                        </ul>
                    </div>

                    {/* Technologies */}
                    <div className="footer-col">
                        <h4>Built With</h4>
                        <ul>
                            {['AWS Cloud', 'Amazon Bedrock', 'React + Vite', 'FastAPI', 'Python'].map(tech => (
                                <li key={tech} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.95rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block' }} />
                                    {tech}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Vidya-Setu. Made with ❤️ for Bharat. Built on <span style={{ color: 'var(--cyan)' }}>AWS</span>.</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>Privacy Policy</a>
                        <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>Terms of Service</a>
                        <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>Contact</a>
                    </div>
                </div>
            </footer>

            {/* Background decorative floating elements */}
            <div className="bg-floating-icon flask-icon animate-float" />
            <div className="bg-floating-icon book-icon animate-float" style={{ animationDelay: '2s' }} />
        </div>
    );
}
