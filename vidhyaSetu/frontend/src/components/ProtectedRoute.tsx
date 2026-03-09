import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0a2e 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}
