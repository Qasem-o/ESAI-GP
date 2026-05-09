import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { TrendingUp, Eye, EyeOff, Mail, Lock, User, Loader2, AtSign } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { EmailVerification } from "./EmailVerification";
import { SocialLogin } from "./SocialLogin";
import logoImg from "../assets/logo.png";
import logoDarkImg from "../assets/logo-dark.png";

interface SignupProps {
  onGoToHome: () => void;
  onGoToLogin: () => void;
  onGoToDashboard: () => void;
}

export function Signup({ onGoToHome, onGoToLogin, onGoToDashboard }: SignupProps) {
  const { signup, isLoading } = useAuth();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(""); // Clear error on input change
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'ar' ? 'كلمتا المرور غير متطابقتين!' : "Passwords don't match!");
      return;
    }

    if (!agreedToTerms) {
      setError(language === 'ar' ? 'يجب الموافقة على الشروط والأحكام' : "Please agree to the terms and conditions");
      return;
    }

    if (formData.password.length < 8) {
      setError(language === 'ar' ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : "Password must be at least 8 characters long");
      return;
    }

    try {
      // Use both username and fullName provided by the user
      await signup(formData.email, formData.username, formData.fullName, formData.password);
      setVerificationStep(true);
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'فشل إنشاء الحساب. حاول مرة أخرى.' : 'Failed to create account. Please try again.'));
    }
  };

  const handleVerificationSuccess = () => {
    // Verification successful, tokens are stored by AuthContext
    // Navigate to dashboard
    localStorage.setItem('show_disclaimer', 'true');
    onGoToDashboard();
  };

  if (verificationStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col items-center justify-center p-4">
        <EmailVerification
          email={formData.email}
          onVerified={handleVerificationSuccess}
        />
        <Button variant="ghost" className="mt-4" onClick={() => setVerificationStep(false)}>
          {language === 'ar' ? 'العودة للتسجيل' : 'Back to Signup'}
        </Button>
      </div>
    );
  }

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
              <span className="text-lg sm:text-xl md:text-2xl font-semibold">EyeStocks AI</span>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
              </span>
              <Button variant="ghost" onClick={onGoToLogin}>
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
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
                <CardTitle className="text-xl">{language === 'ar' ? 'إنشاء حساب جديد' : 'Create Your Account'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'انضم لآلاف المتداولين الذين يستخدمون الذكاء الاصطناعي' : 'Join thousands of traders using AI for smarter investments'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.auth.fullName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={language === 'ar' ? 'مثال: علي أحمد' : 'e.g. Ali Ahmed'}
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="pl-10 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{t.auth.username}</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="ali_21"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="pl-10 h-12"
                      required
                      minLength={3}
                      pattern="^[a-zA-Z0-9_-]+$"
                      title="Username must contain only letters, numbers, hyphens, and underscores"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t.auth.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={language === 'ar' ? 'أنشئ كلمة مرور قوية' : 'Create a strong password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm your password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
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
                    onCheckedChange={(checked: boolean | "indeterminate") => setAgreedToTerms(checked === true)}
                    className="mt-0.5"
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-xs leading-5">
                    {language === 'ar' ? 'أوافق على' : 'I agree to the'}{" "}
                    <Button variant="link" className="p-0 h-auto text-xs" type="button">
                      {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                    </Button>{" "}
                    {language === 'ar' ? 'و' : 'and'}{" "}
                    <Button variant="link" className="p-0 h-auto text-xs" type="button">
                      {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                    </Button>
                  </Label>
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                      <TrendingUp className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    {language === 'ar' ? 'أو تابع باستخدام' : 'OR CONTINUE WITH'}
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <SocialLogin mode="signup" />

              <div className="text-center text-sm text-muted-foreground">
                {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{" "}
                <Button variant="link" className="p-0 h-auto" onClick={onGoToLogin}>
                  {language === 'ar' ? 'سجّل دخولك هنا' : 'Sign in here'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 EyeStocks AI. {t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}