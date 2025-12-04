'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    verifyEmail: (id: string, hash: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

interface LoginResponse {
    user: User;
    access_token: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get base URL from environment
const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};

// Get locale from i18n
const getLocale = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('i18nextLng') || 'vi';
    }
    return 'vi';
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load token from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setAccessToken(token);
            // Fetch user data
            fetchCurrentUser(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    // API call helper
    const apiCall = async <T,>(
        endpoint: string,
        options: RequestInit = {},
        requiresAuth = true,
    ): Promise<ApiResponse<T>> => {
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Accept-Language': getLocale(),
        };

        if (requiresAuth && accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${getBaseUrl()}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...(options.headers as Record<string, string>),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }

        return data;
    };

    // Fetch current user
    const fetchCurrentUser = async (token: string) => {
        try {
            const response = await fetch(`${getBaseUrl()}/api/auth/me`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                    'Accept-Language': getLocale(),
                },
            });

            if (response.ok) {
                const data: ApiResponse<User> = await response.json();
                if (data.success && data.data) {
                    setUser(data.data);
                }
            } else {
                // Token invalid, clear it
                localStorage.removeItem('access_token');
                setAccessToken(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('access_token');
            setAccessToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Login
    const login = async (email: string, password: string) => {
        try {
            const response = await apiCall<LoginResponse>(
                '/api/auth/login',
                {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                },
                false,
            );

            if (response.success && response.data) {
                const { user: userData, access_token } = response.data;
                setUser(userData);
                setAccessToken(access_token);
                localStorage.setItem('access_token', access_token);
            }
        } catch (error) {
            throw error;
        }
    };

    // Register
    const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
        try {
            const response = await apiCall<LoginResponse>(
                '/api/auth/register',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        password_confirmation: passwordConfirmation,
                    }),
                },
                false,
            );

            if (response.success && response.data) {
                const { user: userData, access_token } = response.data;
                setUser(userData);
                setAccessToken(access_token);
                localStorage.setItem('access_token', access_token);
            }
        } catch (error) {
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            if (accessToken) {
                await apiCall('/api/auth/logout', {
                    method: 'POST',
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('access_token');
            router.push('/login');
        }
    };

    // Logout all devices
    const logoutAll = async () => {
        try {
            if (accessToken) {
                await apiCall('/api/auth/logout-all', {
                    method: 'POST',
                });
            }
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('access_token');
            router.push('/login');
        }
    };

    // Update profile
    const updateProfile = async (data: { name?: string; email?: string }) => {
        try {
            const response = await apiCall<User>('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(data),
            });

            if (response.success && response.data) {
                setUser(response.data);
            }
        } catch (error) {
            throw error;
        }
    };

    // Change password
    const changePassword = async (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
        try {
            await apiCall('/api/auth/password', {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: newPasswordConfirmation,
                }),
            });

            // After password change, user must login again
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('access_token');
            router.push('/login');
        } catch (error) {
            throw error;
        }
    };

    // Request password reset
    const requestPasswordReset = async (email: string) => {
        try {
            await apiCall(
                '/api/auth/forgot-password',
                {
                    method: 'POST',
                    body: JSON.stringify({ email }),
                },
                false,
            );
        } catch (error) {
            throw error;
        }
    };

    // Reset password with token
    const resetPassword = async (token: string, email: string, password: string, passwordConfirmation: string) => {
        try {
            await apiCall(
                '/api/auth/reset-password',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        token,
                        email,
                        password,
                        password_confirmation: passwordConfirmation,
                    }),
                },
                false,
            );
        } catch (error) {
            throw error;
        }
    };

    // Verify email
    const verifyEmail = async (id: string, hash: string) => {
        try {
            await apiCall(
                '/api/auth/verify-email',
                {
                    method: 'POST',
                    body: JSON.stringify({ id, hash }),
                },
                false,
            );
        } catch (error) {
            throw error;
        }
    };

    // Resend verification email
    const resendVerificationEmail = async () => {
        try {
            await apiCall('/api/auth/resend-verification-email', {
                method: 'POST',
            });
        } catch (error) {
            throw error;
        }
    };

    // Refresh user data
    const refreshUser = async () => {
        if (accessToken) {
            await fetchCurrentUser(accessToken);
        }
    };

    const value: AuthContextType = {
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        logoutAll,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
