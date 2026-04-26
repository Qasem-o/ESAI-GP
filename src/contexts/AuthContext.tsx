/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, UserProfile, AuthResponse } from '../services/authApi';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, username: string, full_name: string, password: string) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    resendVerification: (email: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>;
    loginWithTelegram: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (authAPI.isAuthenticated()) {
                    const storedUser = authAPI.getStoredUser();
                    if (storedUser) {
                        setUser(storedUser);

                        // Optionally fetch fresh user data
                        try {
                            const freshUser = await authAPI.getCurrentUser();
                            setUser(freshUser);
                        } catch (error) {
                            console.error('Failed to fetch fresh user data:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                authAPI.logout();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const signup = async (email: string, username: string, full_name: string, password: string) => {
        setIsLoading(true);
        try {
            await authAPI.signup({ email, username, full_name, password });
            // Note: User is not set here, will be set after email verification
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        setIsLoading(true);
        try {
            const authData = await authAPI.verifyEmail({ email, code });
            setUser(authData.user);
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerification = async (email: string) => {
        await authAPI.resendVerification(email);
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const authData = await authAPI.login({ email, password });
            setUser(authData.user);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        setIsLoading(true);
        try {
            const updatedUser = await authAPI.updateProfile(data);
            setUser(updatedUser);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (token: string) => {
        setIsLoading(true);
        try {
            const authData = await authAPI.googleLogin(token);
            setUser(authData.user);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithTelegram = async (data: any) => {
        setIsLoading(true);
        try {
            const authData = await authAPI.telegramLogin(data);
            setUser(authData.user);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        verifyEmail,
        resendVerification,
        logout,
        updateProfile,
        loginWithGoogle,
        loginWithTelegram,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
