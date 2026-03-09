import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface User {
    id: string;
    email: string;
}

export interface Session {
    user: User;
    access_token: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for local storage session
        const storedUser = localStorage.getItem('vidya_setu_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setSession({ user: parsedUser, access_token: 'dummy_token' });
            } catch (e) {
                console.error("Local storage parse error:", e);
            }
        }
        setIsLoading(false);
    }, []);

    const signIn = async (email: string) => {
        const newUser: User = { id: crypto.randomUUID(), email };
        setUser(newUser);
        setSession({ user: newUser, access_token: 'dummy_token' });
        localStorage.setItem('vidya_setu_user', JSON.stringify(newUser));
    };

    const signOut = async () => {
        setUser(null);
        setSession(null);
        localStorage.removeItem('vidya_setu_user');
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
