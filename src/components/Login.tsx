import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Header } from "./Header";
import { Alert, AlertDescription } from "./ui/alert";
import { TrendingUp, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { EmailVerification } from "./EmailVerification";
import { SocialLogin } from "./SocialLogin";
import { authAPI } from "../services/authApi";
import logoImg from "../assets/logo.png";
import logoDarkImg from "../assets/logo-dark.png";

interface LoginProps {
  onGoToHome: () => void;
  onGoToSignup: () => void;
  onGoToDashboard: () => void;
}

export function Login({ onGoToHome, onGoToSignup, onGoToDashboard }: LoginProps) {
  const { login, resendVerification, isLoading } = useAuth();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);

    try {
      await login(email, password);
      onGoToDashboard();
    } catch (err: any) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);

      // Check if error is due to unverified email
      if (errorMessage.includes("verify your email")) {
        setNeedsVerification(true);
      }
    }
  };

  const handleVerificationSuccess = () => {
    // Navigate to dashboard after verification
    onGoToDashboard();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setIsResetLoading(true);

    try {
      await authAPI.forgotPassword(resetEmail);
      setResetStep(2);
    } catch (err: any) {
      setResetError(err.message || "Failed to send reset link");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setIsResetLoading(true);

    try {
      await authAPI.resetPassword({
        email: resetEmail,
        code: resetCode,
        new_password: newPassword,
      });
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setResetStep(1);
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
      }, 4000);
    } catch (err: any) {
      setResetError(err.message || "Failed to reset password");
    } finally {
      setIsResetLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col items-center justify-center p-4">
        <EmailVerification
          email={email}
          onVerified={handleVerificationSuccess}
        />
        <Button variant="ghost" className="mt-4" onClick={() => setNeedsVerification(false)}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col">
      {/* Header */}
      <Header
        currentPage="login"
        onGoToHome={onGoToHome}
        onGoToExplore={() => { }}
        onGoToPortfolio={() => { }}
        onGoToSimulator={() => { }}
        onGoToProfile={() => { }}
        onGoToSignup={onGoToSignup}
        onGoToLogin={() => { }}
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">

            <p className="text-muted-foreground">

            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-4 pb-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={theme === 'dark' ? logoDarkImg : logoImg}
                    alt="EyeStocks AI Logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <span className="text-2xl font-semibold">EyeStocks AI</span>
              </div>
              <div>
                <CardDescription>
                  Sign in to continue your trading journey
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-xs" type="button">
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            {resetStep === 1 
                              ? "Enter your email address and we'll send you a 6-digit code to reset your password."
                              : "Enter the 6-digit code sent to your email and your new password."}
                          </DialogDescription>
                        </DialogHeader>

                        {resetError && (
                          <Alert variant="destructive" className="py-2">
                            <AlertDescription>{resetError}</AlertDescription>
                          </Alert>
                        )}

                        {resetSent ? (
                          <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                            ✓ Password has been reset successfully! You can now log in.
                          </div>
                        ) : resetStep === 1 ? (
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="resetEmail">Email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="resetEmail"
                                  type="email"
                                  placeholder="Enter your email"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  className="pl-10 h-12"
                                  required
                                  disabled={isResetLoading}
                                />
                              </div>
                            </div>
                            <Button type="submit" className="w-full h-12" disabled={isResetLoading}>
                              {isResetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Send Reset Code
                            </Button>
                          </form>
                        ) : (
                          <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="resetCode">Verification Code</Label>
                              <Input
                                id="resetCode"
                                type="text"
                                placeholder="123456"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center tracking-widest text-lg h-12"
                                required
                                disabled={isResetLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="newPassword"
                                  type="password"
                                  placeholder="Enter new password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="pl-10 h-12"
                                  required
                                  disabled={isResetLoading}
                                  minLength={8}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">Password must be at least 8 characters</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1 h-12" 
                                onClick={() => setResetStep(1)}
                                disabled={isResetLoading}
                              >
                                Back
                              </Button>
                              <Button type="submit" className="flex-1 h-12" disabled={isResetLoading}>
                                {isResetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Reset Password
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <TrendingUp className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <SocialLogin mode="login" />

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={onGoToSignup}>
                  Sign up for free
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 EyeStocks AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}