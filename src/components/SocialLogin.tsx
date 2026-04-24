import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface SocialLoginProps {
    mode: 'signup' | 'login';
}

declare global {
    interface Window {
        Telegram?: {
            Login: {
                auth: (options: any, callback: (user: any) => void) => void;
            };
        };
    }
}

export function SocialLogin({ mode }: SocialLoginProps) {
    const { loginWithGoogle, loginWithTelegram } = useAuth();
    const navigate = useNavigate();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Custom Google Login - uses access token flow (not iframe, so we control text)
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            try {
                await loginWithGoogle(tokenResponse.access_token);
                // Trigger disclaimer for social login as well
                localStorage.setItem('show_disclaimer', 'true');
                navigate('/');
            } catch (error) {
                console.error('Google login failed:', error);
                alert('Google login failed. Please try again.');
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: () => {
            console.log('Google Login Failed');
            setIsGoogleLoading(false);
        },
    });

    // Check if Telegram bot is configured
    const telegramBotName = import.meta.env.VITE_TELEGRAM_BOT_NAME || '';
    const isTelegramConfigured = telegramBotName && telegramBotName !== 'YOUR_TELEGRAM_BOT_NAME';

    useEffect(() => {
        if (!isTelegramConfigured) return;

        // Load Telegram widget script dynamically
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', telegramBotName);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '8');
        script.setAttribute('data-request-access', 'write');
        script.setAttribute('data-userpic', 'false');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.async = true;

        (window as any).onTelegramAuth = async (user: any) => {
            try {
                await loginWithTelegram(user);
                // Trigger disclaimer for social login as well
                localStorage.setItem('show_disclaimer', 'true');
                navigate('/');
            } catch (error) {
                console.error('Telegram login failed:', error);
            }
        };

        const container = document.getElementById('telegram-login-container');
        if (container) {
            container.innerHTML = '';
            container.appendChild(script);
        }

        return () => {
            delete (window as any).onTelegramAuth;
        };
    }, [loginWithTelegram, navigate, isTelegramConfigured, telegramBotName]);

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Google Login Button - Always English */}
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 rounded-md transition-colors"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
            >
                {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                )}
                <span className="font-medium text-sm">
                    {isGoogleLoading
                        ? 'Signing in...'
                        : mode === 'signup'
                            ? 'Sign up with Google'
                            : 'Sign in with Google'
                    }
                </span>
            </Button>

            {/* Only show Telegram section if configured */}
            {isTelegramConfigured && (
                <>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center w-full" id="telegram-login-container">
                        {/* Telegram widget will be injected here */}
                    </div>
                </>
            )}
        </div>
    );
}
