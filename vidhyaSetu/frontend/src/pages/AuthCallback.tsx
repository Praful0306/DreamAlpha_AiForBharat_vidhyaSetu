import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * AuthCallback — handles the redirect from Supabase email verification.
 * 
 * When a user clicks the magic link in their email, Supabase redirects them
 * to this page with auth tokens in the URL. This component:
 * 1. Exchanges the tokens for a session via supabase.auth.exchangeCodeForSession()
 * 2. Shows a loading spinner while processing
 * 3. Redirects to /dashboard on success, or /auth on failure
 */
export function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            if (!isSupabaseConfigured || !supabase) {
                setError('Authentication is not configured.');
                setTimeout(() => navigate('/auth', { replace: true }), 2000);
                return;
            }

            try {
                // Get the URL params - for PKCE flow, Supabase sends a `code` query param
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (code) {
                    // PKCE flow: exchange the code for a session
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) throw exchangeError;
                } else {
                    // Fallback: try to get session (handles implicit flow with hash fragments)
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError) throw sessionError;
                    if (!session) {
                        // Wait a moment for onAuthStateChange to fire
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        const { data: { session: retrySession } } = await supabase.auth.getSession();
                        if (!retrySession) {
                            throw new Error('No session found. The link may have expired.');
                        }
                    }
                }

                // Success — redirect to dashboard
                navigate('/dashboard', { replace: true });
            } catch (err: any) {
                console.error('Auth callback error:', err);
                setError(err.message || 'Authentication failed. Please try again.');
                setTimeout(() => navigate('/auth', { replace: true }), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div style={{
            minHeight: '100vh', width: '100vw',
            background: 'linear-gradient(135deg, #050914 0%, #0d1225 50%, #0a0a1f 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif"
        }}>
            <div style={{
                textAlign: 'center',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px',
                padding: '60px 48px', maxWidth: '420px', width: '100%', margin: '24px',
                boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
                {error ? (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                        <h2 style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
                            Authentication Error
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                            {error}
                        </p>
                        <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                            Redirecting to login page...
                        </p>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b',
                            animation: 'spin 0.8s linear infinite', margin: '0 auto 24px'
                        }} />
                        <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
                            Verifying Your Email...
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            Please wait while we sign you in.
                        </p>
                    </>
                )}
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
