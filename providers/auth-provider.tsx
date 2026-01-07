'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, createRawClient, extractData } from '@/lib/api/client';

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
            fetchCurrentUser(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    // Fetch current user (SILENT - no toast on error)
    const fetchCurrentUser = async (token: string) => {
        try {
            // Use raw client without interceptors to avoid auto-toast
            const rawClient = createRawClient();
            const response = await rawClient.get<ApiResponse<User>>('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data;
            if (data.success && data.data) {
                setUser(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Token invalid, clear it
            localStorage.removeItem('access_token');
            setAccessToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Login - use regular apiClient (shows toast on error)
    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', {
                email,
                password,
            });

            const data = extractData(response);
            if (data.success && data.data) {
                const { user: userData, access_token } = data.data;
                setUser(userData);
                setAccessToken(access_token);
                localStorage.setItem('access_token', access_token);
            }
        } catch (error) {
            // Error toast already shown by interceptor
            throw error;
        }
    };

    // Register - use regular apiClient
    const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
        try {
            const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            const data = extractData(response);
            if (data.success && data.data) {
                const { user: userData, access_token } = data.data;
                setUser(userData);
                setAccessToken(access_token);
                localStorage.setItem('access_token', access_token);
            }
        } catch (error) {
            throw error;
        }
    };

    // Logout - use regular apiClient
    const logout = async () => {
        try {
            if (accessToken) {
                await apiClient.post('/api/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('access_token');
            router.push('/signin');
        }
    };

    // Logout all devices
    const logoutAll = async () => {
        try {
            if (accessToken) {
                await apiClient.post('/api/auth/logout-all');
            }
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('access_token');
            router.push('/signin');
        }
    };

    // Update profile
    const updateProfile = async (data: { name?: string; email?: string }) => {
        try {
            const response = await apiClient.put<ApiResponse<User>>('/api/auth/profile', data);
            const result = extractData(response);

            if (result.success && result.data) {
                setUser(result.data);
            }
        } catch (error) {
            throw error;
        }
    };

    // Change password
    const changePassword = async (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
        try {
            await apiClient.put('/api/auth/password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation,
            });

            // After password change, user must login again
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('access_token');
            router.push('/signin');
        } catch (error) {
            throw error;
        }
    };

    // Request password reset
    const requestPasswordReset = async (email: string) => {
        try {
            await apiClient.post('/api/auth/forgot-password', { email });
        } catch (error) {
            throw error;
        }
    };

    // Reset password with token
    const resetPassword = async (token: string, email: string, password: string, passwordConfirmation: string) => {
        try {
            await apiClient.post('/api/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
        } catch (error) {
            throw error;
        }
    };

    // Verify email
    const verifyEmail = async (id: string, hash: string) => {
        try {
            await apiClient.post('/api/auth/verify-email', { id, hash });
        } catch (error) {
            throw error;
        }
    };

    // Resend verification email
    const resendVerificationEmail = async () => {
        try {
            await apiClient.post('/api/auth/resend-verification-email');
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
