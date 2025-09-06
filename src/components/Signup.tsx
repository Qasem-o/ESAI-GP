import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { TrendingUp, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

interface SignupProps {
  onGoToHome: () => void;
  onGoToLogin: () => void;
  onGoToDashboard: () => void;
}

export function Signup({ onGoToHome, onGoToLogin, onGoToDashboard }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    // Mock signup - in real app, this would create account
    onGoToDashboard();
  };

  const handleGoogleSignup = () => {
    // Mock Google signup - in real app, this would integrate with Google OAuth
    onGoToDashboard();
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
                Already have an account?
              </span>
              <Button variant="ghost" onClick={onGoToLogin}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            

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
                <CardTitle className="text-xl">Create Your Account</CardTitle>
                <CardDescription>
                Join thousands of traders using AI for smarter investments
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                                 <div className="space-y-2">
                   <Label htmlFor="fullName">Full Name</Label>
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="fullName"
                       type="text"
                       placeholder="Enter your full name"
                       value={formData.fullName}
                       onChange={(e) => handleInputChange("fullName", e.target.value)}
                       className="pl-10 h-12"
                       required
                     />
                   </div>
                 </div>

                                 <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="email"
                       type="email"
                       placeholder="Enter your email"
                       value={formData.email}
                       onChange={(e) => handleInputChange("email", e.target.value)}
                       className="pl-10 h-12"
                       required
                     />
                   </div>
                 </div>
                
                                 <div className="space-y-2">
                   <Label htmlFor="password">Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="password"
                       type={showPassword ? "text" : "password"}
                       placeholder="Create a strong password"
                       value={formData.password}
                       onChange={(e) => handleInputChange("password", e.target.value)}
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

                                 <div className="space-y-2">
                   <Label htmlFor="confirmPassword">Confirm Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="confirmPassword"
                       type={showConfirmPassword ? "text" : "password"}
                       placeholder="Confirm your password"
                       value={formData.confirmPassword}
                       onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                       className="pl-10 pr-10 h-12"
                       required
                     />
                     <Button
                       type="button"
                       variant="ghost"
                       size="sm"
                       className="absolute right-0 top-0 h-12 px-3"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     >
                       {showConfirmPassword ? (
                         <EyeOff className="h-4 w-4" />
                       ) : (
                         <Eye className="h-4 w-4" />
                       )}
                     </Button>
                   </div>
                 </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={setAgreedToTerms}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-xs leading-5">
                    I agree to the{" "}
                    <Button variant="link" className="p-0 h-auto text-xs">
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button variant="link" className="p-0 h-auto text-xs">
                      Privacy Policy
                    </Button>
                  </Label>
                </div>

                <Button type="submit" className="w-full h-12">
                  Create Account
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

              {/* Google Sign Up */}
              <Button 
                variant="outline" 
                className="w-full h-12 gap-3"
                onClick={handleGoogleSignup}
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
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={onGoToLogin}>
                  Sign in here
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