import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EmailVerificationProps {
    email: string;
    onVerified: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
    const { verifyEmail, resendVerification, isLoading } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Handle countdown for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Check if pasted content is a 6-digit number
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setCode(digits);
            // Construct full code and verify immediately
            handleVerify(digits.join(''));
            // Focus last input
            inputRefs.current[5]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (verificationCode?: string) => {
        const codeToVerify = verificationCode || code.join('');

        if (codeToVerify.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        try {
            setError('');
            await verifyEmail(email, codeToVerify);
            onVerified();
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            setError('');
            await resendVerification(email);
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err: any) {
            setError(err.message || 'Failed to resend code');
        }
    };

    // Auto-submit when all fields are filled
    useEffect(() => {
        if (code.every(digit => digit !== '')) {
            handleVerify();
        }
    }, [code]);

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-0">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                <CardDescription>
                    We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="code-0" className="sr-only">Verification Code</Label>
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                id={`code-${index}`}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-12 text-center text-xl font-bold p-0"
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button
                    className="w-full h-11"
                    onClick={() => handleVerify()}
                    disabled={isLoading || code.some(d => !d)}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify Email
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground mb-2">Didn't receive the code?</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-primary hover:text-primary/80"
                    >
                        {resendCooldown > 0 ? (
                            <span className="flex items-center">
                                Resend in {resendCooldown}s
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <RefreshCw className="mr-2 h-3 w-3" />
                                Resend Code
                            </span>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
