'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { callApiGetUserProfile, callApiLogin, callApiLogout } from '@/api/auth';

export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
    avatar?: string | null;
    roleId?: string | null;
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (payload: { email: string; password: string }) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Using axios-based ApiCaller in /api

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await callApiGetUserProfile();
            const data = res.data as unknown;

            let nextUser: AuthUser | null = null;
            if (data && typeof data === 'object') {
                if ('user' in data) {
                    const possible = (data as { user?: unknown }).user;
                    if (possible && typeof possible === 'object' && 'id' in possible && 'email' in possible) {
                        nextUser = possible as AuthUser;
                    }
                } else if ('id' in data && 'email' in data) {
                    nextUser = data as AuthUser;
                }
            }

            setUser(nextUser);
        } catch {
            setUser(null);
        }
    }, []);

    const signIn = useCallback(
        async ({ email, password }: { email: string; password: string }) => {
            await callApiLogin({ email, password });
            await refreshUser();
        },
        [refreshUser],
    );

    const signOut = useCallback(async () => {
        try {
            await callApiLogout();
        } finally {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await refreshUser();
            setIsLoading(false);
        })();
    }, [refreshUser]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            signIn,
            signOut,
            refreshUser,
        }),
        [user, isLoading, signIn, signOut, refreshUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
