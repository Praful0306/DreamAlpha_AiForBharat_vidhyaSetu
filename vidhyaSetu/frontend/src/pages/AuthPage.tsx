import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSending, setIsSending] = useState(false);

    const validateGmail = (val: string) => {
        if (!val.endsWith('@gmail.com')) {
            setEmailError('Only @gmail.com addresses are accepted');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (e.target.value.includes('@')) validateGmail(e.target.value);
        else setEmailError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateGmail(email)) return;
        setIsSending(true);

        try {
            await signIn(email);
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setEmailError(err.message || 'Login failed.');
            setIsSending(false);
        }
    };

    const bgStyle: React.CSSProperties = {
        minHeight: '100vh', width: '100vw',
        background: 'linear-gradient(135deg, #050914 0%, #0d1225 50%, #0a0a1f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', fontFamily: "'Space Grotesk', 'Inter', sans-serif"
    };

    const cardStyle: React.CSSProperties = {
        width: '100%', maxWidth: '440px', margin: '24px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', padding: '40px 36px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative', zIndex: 10
    };

    const orbs = [
        { size: 400, top: '-10%', left: '-10%', color: 'rgba(79,70,229,0.25)' },
        { size: 300, top: '60%', right: '-5%', color: 'rgba(139,92,246,0.2)' },
        { size: 250, top: '30%', left: '60%', color: 'rgba(245,158,11,0.1)' },
    ];

    const globalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        @keyframes float-orb { from { transform:translate(0,0) scale(1); } to { transform:translate(20px,30px) scale(1.05); } }
    `;

    const OrbsBg = () => (
        <>
            {orbs.map((orb, i) => (
                <div key={i} style={{
                    position: 'absolute', borderRadius: '50%', width: orb.size, height: orb.size,
                    background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                    top: orb.top, left: (orb as any).left, right: (orb as any).right,
                    animation: `float-orb ${6 + i * 2}s ease-in-out infinite alternate`,
                    pointerEvents: 'none', filter: 'blur(40px)'
                }} />
            ))}
        </>
    );

    return (
        <div style={bgStyle}>
            <OrbsBg />
            <div style={cardStyle}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px', fontSize: '26px',
                        boxShadow: '0 8px 24px rgba(245,158,11,0.4)'
                    }}>🌉</div>
                    <h1 style={{ color: '#f1f5f9', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px' }}>Vidya-Setu</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Instant Access Dashboard</p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Welcome!</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>Enter your Gmail address to access the application immediately.</p>
                </div>

                {/* Email Form */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <input
                            type="email" value={email} onChange={handleEmailChange}
                            placeholder="yourname@gmail.com" required
                            style={{
                                width: '100%', padding: '14px 18px',
                                background: 'rgba(255,255,255,0.06)',
                                border: `1px solid ${emailError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '14px', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none',
                                transition: 'all 0.2s', boxSizing: 'border-box'
                            }}
                        />
                        {emailError && <p style={{ color: '#f87171', fontSize: '0.78rem', margin: '6px 0 0 4px' }}>⚠ {emailError}</p>}
                    </div>

                    <button type="submit" disabled={isSending || !email}
                        style={{
                            width: '100%', padding: '15px', marginTop: '10px',
                            background: isSending ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                            border: 'none', borderRadius: '14px', color: '#0f172a', fontWeight: 800,
                            fontSize: '1rem', cursor: isSending || !email ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s', boxShadow: '0 6px 20px rgba(245,158,11,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                        {isSending ? 'Entering...' : 'Log In Now'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.75rem', marginTop: '24px', lineHeight: 1.5 }}>
                    By continuing, you agree to Vidya-Setu's Terms of Service
                </p>
            </div>
            <style>{globalStyles}</style>
        </div>
    );
}
