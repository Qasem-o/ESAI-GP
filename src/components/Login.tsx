import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { TrendingUp, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginProps {
  onGoToHome: () => void;
  onGoToSignup: () => void;
  onGoToDashboard: () => void;
}

export function Login({ onGoToHome, onGoToSignup, onGoToDashboard }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app, this would authenticate
    onGoToDashboard();
  };

  const handleGoogleLogin = () => {
    // Mock Google login - in real app, this would integrate with Google OAuth
    onGoToDashboard();
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock forgot password - in real app, this would send reset email
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setResetEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onGoToHome}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-white">
                <img 
                  src="/src/assets/logo.png" 
                  alt="StockEye AI Logo" 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold">EyeStock AI</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Don't have an account?
              </span>
              <Button variant="ghost" onClick={onGoToSignup}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-white">
                <img 
                  src="/src/assets/logo.png" 
                  alt="StockEye AI Logo" 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                  }}
                />
              </div>
                <span className="text-2xl font-semibold">EyeStock AI</span>
              </div>
              <div>
                <CardDescription>
                  Sign in to continue your trading journey
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
                     />
                   </div>
                 </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>
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
                               />
                             </div>
                           </div>
                          {resetSent ? (
                            <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                              ✓ Password reset link sent to your email!
                            </div>
                          ) : (
                            <Button type="submit" className="w-full h-12">
                              Send Reset Link
                            </Button>
                          )}
                        </form>
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
                     />
                     <Button
                       type="button"
                       variant="ghost"
                       size="sm"
                       className="absolute right-0 top-0 h-12 px-3"
                       onClick={() => setShowPassword(!showPassword)}
                     >
                       {showPassword ? (
                         <EyeOff className="h-4 w-4" />
                       ) : (
                         <Eye className="h-4 w-4" />
                       )}
                     </Button>
                   </div>
                </div>

                <Button type="submit" className="w-full h-12">
                  Sign In
                  <TrendingUp className="w-4 h-4 ml-2" />
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

              {/* Google Sign In */}
              <Button 
                variant="outline" 
                className="w-full h-12 gap-3"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

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
          <p>&copy; 2025 StockEye AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}