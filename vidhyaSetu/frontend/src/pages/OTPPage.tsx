import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const OTP_EXPIRY_SECONDS = 300; // 5 minutes

export function OTPPage() {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
    const [resendSuccess, setResendSuccess] = useState(false);
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const email = sessionStorage.getItem('vidya_otp_email') || '';

    // Countdown timer
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
        return () => clearInterval(id);
    }, [secondsLeft]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // Redirect to /auth if no email in session
    useEffect(() => {
        if (!email) navigate('/auth', { replace: true });
    }, [email, navigate]);

    // Focus first input on mount
    useEffect(() => {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, []);

    const handleDigitChange = (index: number, value: string) => {
        // Allow only single digit
        const clean = value.replace(/\D/g, '').slice(-1);
        const updated = [...digits];
        updated[index] = clean;
        setDigits(updated);
        setError('');

        // Auto-advance focus
        if (clean && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = useCallback(async () => {
        const code = digits.join('');
        if (code.length < 6) { setError('Please enter all 6 digits'); return; }
        setIsVerifying(true);
        setError('');
        if (!isSupabaseConfigured) {
            setError('Verification is currently disabled (Supabase not configured).');
            setIsVerifying(false);
            return;
        }

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'email'
            });
            if (verifyError) throw verifyError;
            sessionStorage.removeItem('vidya_otp_email');
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setError('Incorrect code. Please try again.');
            // Clear digits and refocus first
            setDigits(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally {
            setIsVerifying(false);
        }
    }, [digits, email, navigate]);

    const handleResend = async () => {
        if (secondsLeft > 0 || isResending) return;
        setIsResending(true);
        if (!isSupabaseConfigured) {
            setError('Resending is currently disabled (Supabase not configured).');
            setIsResending(false);
            return;
        }

        try {
            await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
            setSecondsLeft(OTP_EXPIRY_SECONDS);
            setDigits(['', '', '', '', '', '']);
            setError('');
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 3000);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } catch (err: any) {
            setError('Failed to resend. Try again.');
        } finally {
            setIsResending(false);
        }
    };

    // Auto-verify when all 6 digits filled
    useEffect(() => {
        if (digits.every(d => d !== '') && digits.join('').length === 6) {
            handleVerify();
        }
    }, [digits, handleVerify]);

    return (
        <div style={{
            minHeight: '100vh', width: '100vw',
            background: 'linear-gradient(135deg, #050914 0%, #0d1225 50%, #0a0a1f 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', fontFamily: "'Space Grotesk', 'Inter', sans-serif"
        }}>
            {/* Background orbs */}
            {[
                { w: 350, t: '-5%', l: '-5%', c: 'rgba(79,70,229,0.2)' },
                { w: 280, t: '65%', r: '-5%', c: 'rgba(139,92,246,0.18)' },
                { w: 200, t: '35%', l: '55%', c: 'rgba(245,158,11,0.12)' },
            ].map((o, i) => (
                <div key={i} style={{
                    position: 'absolute', borderRadius: '50%', width: o.w, height: o.w,
                    background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
                    top: o.t, left: o.l, right: (o as any).r,
                    filter: 'blur(40px)', pointerEvents: 'none',
                    animation: `float-orb ${6 + i * 2}s ease-in-out infinite alternate`
                }} />
            ))}

            {/* Glass card */}
            <div style={{
                width: '100%', maxWidth: '420px', margin: '24px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px',
                padding: '40px 36px',
                boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                position: 'relative', zIndex: 10
            }}>
                {/* Back button */}
                <button onClick={() => navigate('/auth')} style={{
                    position: 'absolute', top: '20px', left: '20px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#94a3b8', padding: '8px 12px',
                    cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px',
                    transition: 'all 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    ← Back
                </button>

                {/* Email icon */}
                <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '8px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: '28px',
                        boxShadow: '0 8px 28px rgba(245,158,11,0.45)',
                        animation: 'pulse-glow 2s ease-in-out infinite'
                    }}>✉️</div>
                    <h2 style={{ color: '#f1f5f9', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px' }}>Check Your Email</h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                        We sent a 6-digit verification code to<br />
                        <strong style={{ color: '#f59e0b' }}>{email}</strong>
                    </p>
                </div>

                {/* 6 Digit Inputs */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }} onPaste={handlePaste}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={el => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handleDigitChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            style={{
                                width: '48px', height: '56px', textAlign: 'center',
                                fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9',
                                background: 'rgba(255,255,255,0.06)',
                                border: `2px solid ${error ? 'rgba(239,68,68,0.5)' : d ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '14px', outline: 'none', transition: 'all 0.2s',
                                boxShadow: d ? '0 0 12px rgba(245,158,11,0.25)' : 'none'
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.2)'; }}
                            onBlur={e => { if (!e.currentTarget.value) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; } }}
                        />
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div style={{ textAlign: 'center', marginBottom: '16px', animation: 'shake 0.4s ease' }}>
                        <span style={{ color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            🔴 {error}
                        </span>
                    </div>
                )}

                {/* Success re-send message */}
                {resendSuccess && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <span style={{ color: '#22c55e', fontSize: '0.85rem' }}>✅ New code sent!</span>
                    </div>
                )}

                {/* Verify button */}
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || digits.some(d => !d)}
                    style={{
                        width: '100%', padding: '15px',
                        background: isVerifying || digits.some(d => !d) ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none', borderRadius: '14px', color: '#0f172a',
                        fontWeight: 800, fontSize: '1rem', cursor: isVerifying || digits.some(d => !d) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', boxShadow: '0 6px 20px rgba(245,158,11,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        marginBottom: '20px'
                    }}
                    onMouseEnter={e => { if (!isVerifying) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                    {isVerifying ? (
                        <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0f172a', animation: 'spin 0.7s linear infinite' }} /> Verifying...</>
                    ) : '✓ Verify Code'}
                </button>

                {/* Timer + Resend */}
                <div style={{ textAlign: 'center' }}>
                    {secondsLeft > 0 ? (
                        <p style={{ color: '#475569', fontSize: '0.82rem', margin: '0 0 8px' }}>
                            ⏱ Code expires in <strong style={{ color: '#94a3b8' }}>{formatTime(secondsLeft)}</strong>
                        </p>
                    ) : (
                        <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '0 0 8px' }}>⚠ Code has expired</p>
                    )}
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                        Didn't receive the code?{' '}
                        <button onClick={handleResend} disabled={secondsLeft > 0 || isResending} style={{
                            background: 'none', border: 'none', cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
                            color: secondsLeft > 0 ? '#374151' : '#f59e0b',
                            fontWeight: 700, fontSize: '0.82rem', padding: 0,
                            textDecoration: secondsLeft === 0 ? 'underline' : 'none', transition: 'color 0.2s'
                        }}>
                            {isResending ? 'Sending...' : 'Resend'}
                        </button>
                    </p>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
                @keyframes float-orb { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,30px) scale(1.05); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse-glow { 0%,100% { box-shadow: 0 8px 28px rgba(245,158,11,0.45); } 50% { box-shadow: 0 8px 40px rgba(245,158,11,0.7); } }
                @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-6px); } 40%,80% { transform: translateX(6px); } }
            `}</style>
        </div>
    );
}
