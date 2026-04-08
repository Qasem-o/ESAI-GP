/**
 * Authentication API service
 * Handles all authentication-related API calls
 */

const API_BASE_URL = 'https://esai-backend.onrender.com';

export interface SignupData {
    email: string;
    username: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface VerifyEmailData {
    email: string;
    code: string;
}

export interface UserProfile {
    user_id: number;
    username: string;
    email: string;
    phone_number?: string;
    profile_picture_url?: string;
    bio?: string;
    profile_completed: boolean;
    created_at: string;
    is_verified: boolean;
    last_login?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: UserProfile;
}

export interface MessageResponse {
    message: string;
    success: boolean;
}

class AuthAPI {
    private getHeaders(includeAuth: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async signup(data: SignupData): Promise<MessageResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Signup failed');
        }

        return response.json();
    }

    async verifyEmail(data: VerifyEmailData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Email verification failed');
        }

        const authData: AuthResponse = await response.json();
        this.setSession(authData);
        return authData;
    }

    async resendVerification(email: string): Promise<MessageResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to resend verification code');
        }

        return response.json();
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const authData: AuthResponse = await response.json();
        this.setSession(authData);
        return authData;
    }

    async googleLogin(token: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Google login failed');
        }

        const authData: AuthResponse = await response.json();
        this.setSession(authData);
        return authData;
    }

    async telegramLogin(data: any): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Telegram login failed');
        }

        const authData: AuthResponse = await response.json();
        this.setSession(authData);
        return authData;
    }

    private setSession(authData: AuthResponse) {
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('refresh_token', authData.refresh_token);
        localStorage.setItem('user', JSON.stringify(authData.user));
    }

    async getCurrentUser(): Promise<UserProfile> {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Try to refresh token
                await this.refreshToken();
                // Retry request
                return this.getCurrentUser();
            }
            throw new Error('Failed to get user profile');
        }

        return response.json();
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update profile');
        }

        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }

    async refreshToken(): Promise<void> {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            // Refresh token expired, logout user
            this.logout();
            throw new Error('Session expired. Please login again.');
        }

        const authData: AuthResponse = await response.json();

        // Update tokens
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('refresh_token', authData.refresh_token);
        localStorage.setItem('user', JSON.stringify(authData.user));
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    getStoredUser(): UserProfile | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
}

export const authAPI = new AuthAPI();
