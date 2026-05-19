import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import {
    TrendingUp,
    TrendingDown,
    User,
    Settings as SettingsIcon,
    Lock,
    Briefcase,
    Loader2,
    Upload,
    RotateCw,
    Zap,
    ChevronRight,
    ChevronLeft,
    Shield
} from "lucide-react";
import { authAPI } from "../services/authApi";
import { simulatorAPI } from "../services/simulatorApi";
import { portfolioAPI } from "../services/portfolioApi";
import { API_BASE_URL as API_URL } from "../services/apiConfig";
import { DefaultAvatar } from "./DefaultAvatar";

const parseBioData = (rawBio: string | null) => {
    if (!rawBio) return { cleanBio: "", investorType: "", investmentGoal: "" };
    
    const typeMatch = rawBio.match(/\[INVESTOR_TYPE:(.*?)\]/);
    const goalMatch = rawBio.match(/\[INVESTMENT_GOAL:(.*?)\]/);
    
    let cleanBio = rawBio;
    if (typeMatch) cleanBio = cleanBio.replace(/\[INVESTOR_TYPE:.*?\]/g, "");
    if (goalMatch) cleanBio = cleanBio.replace(/\[INVESTMENT_GOAL:.*?\]/g, "");
    cleanBio = cleanBio.trim();
    
    return {
        cleanBio: cleanBio,
        investorType: typeMatch ? typeMatch[1] : "",
        investmentGoal: goalMatch ? goalMatch[1] : ""
    };
};

export function Settings(props: any) {
    const { user: currentUser, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
    const { t, isRTL, language } = useLanguage();
    const navigate = useNavigate();

    // Active tab state
    const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "security">("profile");

    // Profile fields states
    const [editUsername, setEditUsername] = useState("");
    const [editFullName, setEditFullName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [usernameError, setUsernameError] = useState("");
    const [usernameChecking, setUsernameChecking] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Investor profiling states
    const [investorType, setInvestorType] = useState("");
    const [investmentGoal, setInvestmentGoal] = useState("");

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Portfolio / Simulator reset states
    const [isResettingSim, setIsResettingSim] = useState(false);
    const [isResettingPort, setIsResettingPort] = useState(false);
    const [simResetConfirm, setSimResetConfirm] = useState(false);
    const [portResetConfirm, setPortResetConfirm] = useState(false);

    // Image Cropper modal states
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [cropperSrc, setCropperSrc] = useState("");
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgAspect, setImgAspect] = useState(1);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [authLoading, isAuthenticated, navigate]);

    // Populate initial settings from currentUser
    useEffect(() => {
        if (currentUser) {
            setEditUsername(currentUser.username || "");
            setEditFullName(currentUser.full_name || "");
            setEditPhone(currentUser.phone_number || "");

            const { cleanBio, investorType: parsedType, investmentGoal: parsedGoal } = parseBioData(currentUser.bio || "");
            setEditBio(cleanBio || "");
            setInvestorType(parsedType || "");
            setInvestmentGoal(parsedGoal || "");
            setAvatarPreview(currentUser.profile_picture_url || "");
        }
    }, [currentUser]);

    const handleResetSimulator = async () => {
        setIsResettingSim(true);
        try {
            await simulatorAPI.resetSimulator();
            setSimResetConfirm(false);
            alert(language === "ar" ? "تمت إعادة تعيين محاكاة التداول بنجاح!" : "Trading simulator reset successfully!");
        } catch (err: any) {
            console.error("Error resetting simulator:", err);
            alert(err.message || (language === "ar" ? "فشل إعادة تعيين المحاكي الافتراضي." : "Failed to reset virtual simulator."));
        } finally {
            setIsResettingSim(false);
        }
    };

    const handleResetPortfolio = async () => {
        setIsResettingPort(true);
        try {
            await portfolioAPI.resetPortfolio();
            setPortResetConfirm(false);
            alert(language === "ar" ? "تمت إعادة تعيين محفظتك اليدوية بنجاح!" : "Your manual portfolio was reset successfully!");
        } catch (err: any) {
            console.error("Error resetting portfolio:", err);
            alert(err.message || (language === "ar" ? "فشل إعادة تعيين المحفظة اليدوية." : "Failed to reset manual portfolio."));
        } finally {
            setIsResettingPort(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (newPassword.length < 8) {
            setPasswordError(language === "ar" ? "يجب أن تكون كلمة المرور 8 رموز على الأقل" : "Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(language === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        try {
            await authAPI.changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });
            setPasswordSuccess(language === "ar" ? "تم تغيير كلمة المرور بنجاح!" : "Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            console.error("Error changing password:", err);
            setPasswordError(err.message || (language === "ar" ? "فشل تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية." : "Failed to change password. Please check your current password."));
        } finally {
            setIsChangingPassword(false);
        }
    };

    const checkUsernameAvailability = async (username: string) => {
        if (!username || username === currentUser?.username) {
            setUsernameError("");
            return;
        }

        setUsernameChecking(true);
        try {
            const response = await fetch(`${API_URL}/auth/check-username/${username}`);
            const data = await response.json();

            if (!data.available) {
                setUsernameError(language === "ar" ? "اسم المستخدم مأخوذ بالفعل" : "Username is already taken");
            } else {
                setUsernameError("");
            }
        } catch (error) {
            console.error("Error checking username:", error);
        } finally {
            setUsernameChecking(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        setEditUsername(value);
        // Debounce username check
        const timeoutId = setTimeout(() => {
            checkUsernameAvailability(value);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    // Drag and Drop cropper handlers
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleCropApply = () => {
        if (!cropperSrc) return;
        const image = new Image();
        image.src = cropperSrc;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Clear canvas
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, 400, 400);

            // Save context
            ctx.save();

            // Move origin to center of canvas
            ctx.translate(200, 200);

            // Apply rotation
            ctx.rotate((rotation * Math.PI) / 180);

            // Calculate base dimensions fitting inside the 200x200 box
            const previewSize = 200;
            const scaleFactor = 400 / previewSize;
            const imgRatio = image.width / image.height;

            let drawW, drawH;
            if (imgRatio > 1) {
                drawH = previewSize;
                drawW = previewSize * imgRatio;
            } else {
                drawW = previewSize;
                drawH = previewSize / imgRatio;
            }

            const finalW = drawW * zoom * scaleFactor;
            const finalH = drawH * zoom * scaleFactor;
            const dx = offset.x * scaleFactor;
            const dy = offset.y * scaleFactor;

            ctx.drawImage(image, dx - finalW / 2, dy - finalH / 2, finalW, finalH);
            ctx.restore();

            canvas.toBlob((blob) => {
                if (!blob) return;
                const croppedFile = new File([blob], "avatar.png", { type: "image/png" });
                setEditAvatarFile(croppedFile);
                setAvatarPreview(canvas.toDataURL("image/png"));
                setIsCropperOpen(false);
            }, "image/png");
        };
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(language === "ar" ? "يجب أن يكون حجم الملف أقل من 10 ميجابايت" : "File size must be less than 10MB");
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert(language === "ar" ? "يُسمح فقط بصور JPG و PNG و GIF و WEBP" : "Only JPG, PNG, GIF, and WEBP images are allowed");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                setImgAspect(img.width / img.height);
                setCropperSrc(reader.result as string);
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
                setIsCropperOpen(true);
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const uploadAvatar = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('access_token');
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const response = await fetch(`${API_URL}/auth/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Upload failed');
            }

            const data = await response.json();
            setUploadProgress(100);
            return data.avatar_url;
        } catch (error) {
            console.error("Error uploading avatar:", error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!currentUser) return;

        if (usernameError) {
            alert(language === "ar" ? "يرجى إصلاح الأخطاء قبل الحفظ" : "Please fix errors before saving");
            return;
        }

        setIsSaving(true);
        try {
            let avatarUrl = currentUser.profile_picture_url;

            if (editAvatarFile) {
                avatarUrl = await uploadAvatar(editAvatarFile);
            }

            let finalBio = editBio ? editBio.trim() : "";
            if (investorType) {
                finalBio += `\n\n[INVESTOR_TYPE:${investorType}]`;
            }
            if (investmentGoal) {
                finalBio += `\n\n[INVESTMENT_GOAL:${investmentGoal}]`;
            }

            await updateProfile({
                username: editUsername !== currentUser.username ? editUsername : undefined,
                full_name: editFullName !== currentUser.full_name ? editFullName : undefined,
                phone_number: editPhone || null,
                bio: finalBio || null,
                profile_picture_url: avatarUrl
            } as any);

            alert(language === "ar" ? "تم تحديث بيانات ملفك الشخصي بنجاح!" : "Your profile details have been updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            alert(error.message || (language === "ar" ? "فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى." : "Failed to update profile. Please try again."));
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header {...props} currentPage="settings" />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12" dir={isRTL ? "rtl" : "ltr"}>
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Page Title */}
                    <div className={isRTL ? "text-right" : "text-left"}>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                            {language === "ar" 
                                ? "قم بإدارة بياناتك الشخصية، ملفك الاستثماري، وحماية حسابك وتصفير محفظتك." 
                                : "Manage your personal profile, investor preferences, account security, and portfolio resets."}
                        </p>
                    </div>

                    {/* Dashboard Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-3 space-y-4">
                            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-md">
                                <CardContent className="p-5 flex flex-col items-center text-center">
                                    <div className="relative">
                                        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 bg-muted/30">
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview.startsWith('/') ? `${API_URL}${avatarPreview}` : avatarPreview}
                                                    alt="User avatar"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <User className="w-10 h-10 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-base text-foreground mt-3 leading-snug">
                                        {currentUser?.full_name || currentUser?.username}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">@{currentUser?.username}</p>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-1.5">
                                {[
                                    { id: "profile", label: language === "ar" ? "الملف الشخصي" : "Profile Details", icon: User },
                                    { id: "portfolio", label: language === "ar" ? "إدارة المحفظة" : "Portfolio Settings", icon: Briefcase },
                                    { id: "security", label: language === "ar" ? "الأمان والحماية" : "Security & Password", icon: Lock },
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <Button
                                            key={tab.id}
                                            variant={isActive ? "default" : "ghost"}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`w-full justify-start cursor-pointer rounded-xl h-11 text-sm font-semibold transition-all ${
                                                isActive 
                                                    ? "shadow-md shadow-primary/10" 
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                                            <span>{tab.label}</span>
                                        </Button>
                                    );
                                })}

                                <div className="border-t my-2 border-border/50" />

                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/profile")}
                                    className="w-full justify-start cursor-pointer rounded-xl h-11 text-sm text-foreground/80 hover:bg-muted/50 border-border/60"
                                >
                                    {isRTL ? <ChevronRight className="w-4 h-4 ml-3" /> : <ChevronLeft className="w-4 h-4 mr-3" />}
                                    <span>{language === "ar" ? "العودة للملف الشخصي" : "Back to Profile"}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-9">
                            <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-lg rounded-2xl">
                                <CardContent className="p-6 md:p-8">
                                    {/* 1. PROFILE DETAILS TAB */}
                                    {activeTab === "profile" && (
                                        <div className="space-y-6">
                                            <div className="border-b pb-4">
                                                <h2 className="text-xl font-bold text-foreground">
                                                    {language === "ar" ? "الملف الشخصي والبيانات" : "Profile Details"}
                                                </h2>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {language === "ar" ? "تحديث بياناتك الشخصية واقتصاص الصورة الرمزية وتحديد اهدافك الاستثمارية." : "Update your profile details, avatar image, and investment styles."}
                                                </p>
                                            </div>

                                            {/* Avatar Upload */}
                                            <div className="space-y-3 bg-muted/20 p-4.5 rounded-2xl border border-border/40">
                                                <Label className={isRTL ? 'text-right block' : 'block font-semibold'}>{t.profile.changePicture}</Label>
                                                <div className="flex flex-col sm:flex-row items-center gap-5">
                                                    <div className="h-16 w-16 rounded-full overflow-hidden border bg-background flex items-center justify-center flex-shrink-0">
                                                        {avatarPreview ? (
                                                            <img
                                                                src={avatarPreview.startsWith('/') ? `${API_URL}${avatarPreview}` : avatarPreview}
                                                                alt="Preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-8 h-8 text-primary" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-1.5 text-center sm:text-start w-full">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                            onChange={handleFileSelect}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="cursor-pointer text-xs h-9"
                                                        >
                                                            <Upload className={`w-3.5 h-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                                                            {editAvatarFile ? (language === "ar" ? 'تغيير الصورة' : 'Change Image') : (language === "ar" ? 'تحميل صورة' : 'Upload Image')}
                                                        </Button>
                                                        <p className={`text-[10px] text-muted-foreground ${isRTL ? 'sm:text-right' : 'sm:text-left'}`}>
                                                            {language === "ar" ? "الحد الأقصى 10 ميجابايت. JPG أو PNG أو GIF أو WEBP فقط." : "Max 10MB. JPG, PNG, GIF, or WEBP only."}
                                                        </p>
                                                        {isUploading && (
                                                            <Progress value={uploadProgress} className="mt-2 h-1.5 w-full" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Full Name */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="editFullName" className={isRTL ? 'text-right block font-medium' : 'block font-medium'}>
                                                        {language === "ar" ? "الاسم المعروض (الاسم الكامل)" : "Display Name (Full Name)"}
                                                    </Label>
                                                    <Input
                                                        id="editFullName"
                                                        value={editFullName}
                                                        onChange={(e) => setEditFullName(e.target.value)}
                                                        placeholder="e.g. Ali Ahmed"
                                                        className={isRTL ? 'text-right rounded-xl h-10.5' : 'rounded-xl h-10.5'}
                                                    />
                                                </div>

                                                {/* Username */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="username" className={isRTL ? 'text-right block font-medium' : 'block font-medium'}>
                                                        {t.auth.username} *
                                                    </Label>
                                                    <Input
                                                        id="username"
                                                        value={editUsername}
                                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                                        placeholder="Enter username"
                                                        required
                                                        className={isRTL ? 'text-right rounded-xl h-10.5' : 'rounded-xl h-10.5'}
                                                    />
                                                    {usernameChecking && (
                                                        <p className="text-[11px] text-muted-foreground">{language === "ar" ? "جاري التحقق من التوفر..." : "Checking availability..."}</p>
                                                    )}
                                                    {usernameError && (
                                                        <p className="text-[11px] text-red-500 font-semibold">{usernameError}</p>
                                                    )}
                                                    {!usernameError && editUsername && editUsername !== currentUser?.username && !usernameChecking && (
                                                        <p className="text-[11px] text-green-500 font-semibold">{language === "ar" ? "✓ اسم المستخدم متاح" : "✓ Username available"}</p>
                                                    )}
                                                </div>

                                                {/* Phone Number */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className={isRTL ? 'text-right block font-medium' : 'block font-medium'}>
                                                        {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        value={editPhone}
                                                        onChange={(e) => setEditPhone(e.target.value)}
                                                        placeholder="+1234567890"
                                                        className={isRTL ? 'text-right rounded-xl h-10.5' : 'rounded-xl h-10.5'}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bio */}
                                            <div className="space-y-2">
                                                <Label htmlFor="bio" className={isRTL ? 'text-right block font-medium' : 'block font-medium'}>
                                                    {t.profile.bio}
                                                </Label>
                                                <Textarea
                                                    id="bio"
                                                    value={editBio}
                                                    onChange={(e) => setEditBio(e.target.value)}
                                                    placeholder={language === "ar" ? "أخبرنا قليلاً عن نفسك كمتداول أو مستثمر..." : "Tell us a bit about yourself as a trader or investor..."}
                                                    className={`min-h-[100px] rounded-xl ${isRTL ? 'text-right' : ''}`}
                                                />
                                            </div>

                                            {/* Investor Profiling */}
                                            <div className="border-t pt-5 space-y-4">
                                                <h3 className="text-base font-bold text-primary">
                                                    {language === "ar" ? "الملف الاستثماري والمخاطر" : "Investor Profiling & Goals"}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="investorType" className={isRTL ? 'text-right block font-medium' : 'block font-medium'}>
                                                            {language === "ar" ? "أسلوب التداول والاستثمار" : "Investing Style"}
                                                        </Label>
                                                        <select
                                                            id="investorType"
                                                            value={investorType}
                                                            onChange={(e) => setInvestorType(e.target.value)}
                                                            className={`flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                                                            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                                        >
                                                            <option value="">{language === "ar" ? "-- حدد أسلوبك --" : "-- Select style --"}</option>
                                                            <option value="growth">{language === "ar" ? "📈 مستثمر نمو" : "📈 Growth Investor"}</option>
                                                            <option value="value">{language === "ar" ? "💰 مستثمر عوائد / قيمة" : "💰 Value / Income Investor"}</option>
                                                            <option value="swing">{language === "ar" ? "⚡ مضارب يومي / سريع" : "⚡ Day / Swing Trader"}</option>
                                                            <option value="long_term">{language === "ar" ? "🛡️ مستثمر طويل الأجل" : "🛡️ Long-term Investor"}</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="investmentGoal" className={isRTL ? 'text-right block font-medium' : 'block font-medium'}>
                                                            {language === "ar" ? "هدف الاستثمار الرئيسي" : "Primary Goal"}
                                                        </Label>
                                                        <select
                                                            id="investmentGoal"
                                                            value={investmentGoal}
                                                            onChange={(e) => setInvestmentGoal(e.target.value)}
                                                            className={`flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                                                            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                                        >
                                                            <option value="">{language === "ar" ? "-- حدد هدفك --" : "-- Select goal --"}</option>
                                                            <option value="wealth">{language === "ar" ? "🌱 بناء وتنمية الثروة" : "🌱 Capital Growth"}</option>
                                                            <option value="passive_income">{language === "ar" ? "💸 تحقيق دخل إضافي سلبي" : "💸 Continuous Passive Income"}</option>
                                                            <option value="education">{language === "ar" ? "📚 التعلم والتجربة الآمنة" : "📚 Learning & Strategy Practice"}</option>
                                                            <option value="hedging">{language === "ar" ? "🔒 التحوط وحفظ قيمة الثروة" : "🔒 Asset Hedging"}</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex justify-end gap-3 border-t pt-5">
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    disabled={isSaving || !!usernameError || usernameChecking}
                                                    className="cursor-pointer rounded-xl font-bold px-6 h-11"
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    {t.profile.saveChanges}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. PORTFOLIO SETTINGS TAB */}
                                    {activeTab === "portfolio" && (
                                        <div className="space-y-6">
                                            <div className="border-b pb-4">
                                                <h2 className="text-xl font-bold text-foreground">
                                                    {language === "ar" ? "إعادة تعيين وإدارة المحافظ" : "Portfolio & Simulator Settings"}
                                                </h2>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {language === "ar" 
                                                        ? "تصفير حساب محاكاة التداول الافتراضي أو حذف محفظتك المسجلة يدوياً بنقرة زر واحدة." 
                                                        : "Reset your simulator balance to starting capital or clear all manual holdings tracker records."}
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Simulator Reset Box */}
                                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                                            <Zap className="w-5 h-5 text-amber-500" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-amber-600 dark:text-amber-400">
                                                                {language === "ar" ? "تصفير محاكي التداول الافتراضي" : "Reset Virtual Trade Simulator"}
                                                            </h4>
                                                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                                                                {language === "ar" 
                                                                    ? "سيؤدي هذا الخيار إلى تصفية جميع أسهمك الافتراضية، حذف عمليات التداول الافتراضية بالكامل، وإعادة تعيين رصيدك الأولي إلى $2,000 لبدء التحدي مجدداً."
                                                                    : "This will permanently sell all virtual simulator stocks, delete trade logs, and set your simulator starting cash back to $2,000."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {!simResetConfirm ? (
                                                        <Button 
                                                            variant="destructive" 
                                                            className="w-full cursor-pointer bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl h-11 font-semibold"
                                                            onClick={() => setSimResetConfirm(true)}
                                                        >
                                                            {language === "ar" ? "إعادة تعيين المحاكي الافتراضي" : "Reset Virtual Simulator"}
                                                        </Button>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <Button 
                                                                variant="destructive" 
                                                                className="flex-1 cursor-pointer rounded-xl h-11 font-bold"
                                                                onClick={handleResetSimulator}
                                                                disabled={isResettingSim}
                                                            >
                                                                {isResettingSim ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === "ar" ? "نعم، متأكد" : "Yes, confirm reset")}
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                className="flex-1 cursor-pointer rounded-xl h-11"
                                                                onClick={() => setSimResetConfirm(false)}
                                                            >
                                                                {language === "ar" ? "إلغاء" : "Cancel"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Manual Portfolio Reset Box */}
                                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                                            <RotateCw className="w-5 h-5 text-amber-500" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-amber-600 dark:text-amber-400">
                                                                {language === "ar" ? "إعادة تعيين المحفظة الحقيقية اليدوية" : "Reset Manual Portfolio Tracker"}
                                                            </h4>
                                                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                                                                {language === "ar" 
                                                                    ? "سيؤدي هذا الإجراء إلى حذف كافة الصفقات والأسهم والمدخلات اليدوية التي سجلتها داخل المحفظة لتصفير سجلاتك وإدخال بيانات جديدة."
                                                                    : "This option will permanently delete all manually inputted trades, holdings, and transaction records from your Portfolio tab."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {!portResetConfirm ? (
                                                        <Button 
                                                            variant="destructive" 
                                                            className="w-full cursor-pointer bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl h-11 font-semibold"
                                                            onClick={() => setPortResetConfirm(true)}
                                                        >
                                                            {language === "ar" ? "إعادة تعيين المحفظة اليدوية" : "Reset Manual Portfolio"}
                                                        </Button>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <Button 
                                                                variant="destructive" 
                                                                className="flex-1 cursor-pointer rounded-xl h-11 font-bold"
                                                                onClick={handleResetPortfolio}
                                                                disabled={isResettingPort}
                                                            >
                                                                {isResettingPort ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === "ar" ? "نعم، متأكد" : "Yes, confirm reset")}
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                className="flex-1 cursor-pointer rounded-xl h-11"
                                                                onClick={() => setPortResetConfirm(false)}
                                                            >
                                                                {language === "ar" ? "إلغاء" : "Cancel"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. SECURITY TAB */}
                                    {activeTab === "security" && (
                                        <div className="space-y-6">
                                            <div className="border-b pb-4">
                                                <h2 className="text-xl font-bold text-foreground">
                                                    {language === "ar" ? "تغيير كلمة المرور والحماية" : "Password & Account Security"}
                                                </h2>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {language === "ar" ? "تأمين حسابك عبر تحديث كلمة المرور بشكل دوري." : "Secure your investment account by updating your login password regularly."}
                                                </p>
                                            </div>

                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                {passwordError && (
                                                    <div className="p-3 bg-red-500/10 text-red-500 text-xs rounded-xl border border-red-500/20">
                                                        {passwordError}
                                                    </div>
                                                )}

                                                {passwordSuccess && (
                                                    <div className="p-3 bg-green-500/10 text-green-500 text-xs rounded-xl border border-green-500/20">
                                                        {passwordSuccess}
                                                    </div>
                                                )}

                                                {currentUser?.password_hash && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="currentPassword">{language === "ar" ? "كلمة المرور الحالية" : "Current Password"}</Label>
                                                        <Input
                                                            id="currentPassword"
                                                            type="password"
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            required
                                                            className={isRTL ? 'text-right rounded-xl h-10.5' : 'rounded-xl h-10.5'}
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label htmlFor="newPassword">{language === "ar" ? "كلمة المرور الجديدة" : "New Password"}</Label>
                                                    <Input
                                                        id="newPassword"
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        required
                                                        className={isRTL ? 'text-right rounded-xl h-10.5' : 'rounded-xl h-10.5'}
                                                        placeholder={language === "ar" ? "8 رموز على الأقل" : "At least 8 characters"}
                                                    />
                                                    {newPassword && (
                                                        <div className="space-y-1">
                                                            <div className="flex gap-1 h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                                                                <div className={`h-full transition-all duration-350 ${newPassword.length >= 12 ? 'w-full bg-green-500' : newPassword.length >= 8 ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-red-500'}`} />
                                                            </div>
                                                            <p className={`text-[10px] text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                                                                {newPassword.length >= 12 
                                                                    ? (language === "ar" ? "كلمة مرور قوية جداً 💪" : "Very strong password 💪")
                                                                    : newPassword.length >= 8 
                                                                        ? (language === "ar" ? "كلمة مرور متوسطة القوة" : "Medium strength password")
                                                                        : (language === "ar" ? "كلمة مرور ضعيفة" : "Weak password")}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword">{language === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                        className={isRTL ? 'text-right rounded-xl h-10.5' : 'rounded-xl h-10.5'}
                                                    />
                                                </div>

                                                <Button 
                                                    type="submit" 
                                                    className="w-full cursor-pointer mt-4 rounded-xl h-11 font-bold" 
                                                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                                                >
                                                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                                                    {language === "ar" ? "تحديث كلمة المرور" : "Update Password"}
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Custom Interactive Avatar Cropper Modal */}
            <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
                <DialogContent 
                    className="max-w-[90%] sm:max-w-[420px] max-h-[92vh] flex flex-col p-0 rounded-2xl shadow-2xl border border-muted/50 bg-background/95 backdrop-blur-md overflow-hidden" 
                    dir={isRTL ? "rtl" : "ltr"}
                >
                    <DialogHeader className={`p-6 pb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <DialogTitle className="text-base sm:text-lg">
                            {language === "ar" ? "تعديل واقتصاص صورة الأفاتار" : "Adjust and Crop Avatar Image"}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {language === "ar" 
                                ? "اسحب الصورة لتحريكها، واستخدم شريط التكبير لضبط الحجم." 
                                : "Drag the image to reposition it, and use the slider to zoom."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center justify-center space-y-4 custom-scrollbar">
                        <div 
                            className="relative flex-shrink-0 rounded-full overflow-hidden border-4 border-primary/30 bg-muted/40 shadow-inner flex items-center justify-center cursor-move active:cursor-grabbing select-none aspect-square animate-in zoom-in-95 duration-200"
                            style={{ 
                                width: '200px', 
                                height: '200px', 
                                minWidth: '200px', 
                                minHeight: '200px',
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: '50%'
                            }}
                            onMouseDown={handleDragStart}
                            onMouseMove={handleDragMove}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={handleDragStart}
                            onTouchMove={handleDragMove}
                            onTouchEnd={handleDragEnd}
                        >
                            {cropperSrc && (
                                <img
                                    src={cropperSrc}
                                    alt="Cropping area"
                                    className="select-none pointer-events-none origin-center"
                                    style={{
                                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                        transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        maxWidth: 'none',
                                        maxHeight: 'none',
                                        width: imgAspect > 1 ? 'auto' : '200px',
                                        height: imgAspect > 1 ? '200px' : 'auto',
                                        objectFit: 'cover',
                                        userSelect: 'none'
                                    }}
                                />
                            )}
                            
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary pointer-events-none ring-offset-4 ring-2 ring-background/50" style={{ borderRadius: '50%' }} />
                        </div>

                        <div className="w-full px-2 space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{language === "ar" ? "تصغير" : "Zoom Out"}</span>
                                <span className="font-mono text-primary font-bold text-xs">{(zoom * 100).toFixed(0)}%</span>
                                <span>{language === "ar" ? "تكبير" : "Zoom In"}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.05"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full px-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 cursor-pointer h-9 text-xs sm:text-sm"
                                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                            >
                                <RotateCw className={`w-3.5 h-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                                {language === "ar" ? "تدوير 90°" : "Rotate 90°"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 cursor-pointer h-9 text-xs sm:text-sm"
                                onClick={() => {
                                    setZoom(1);
                                    setRotation(0);
                                    setOffset({ x: 0, y: 0 });
                                }}
                            >
                                {language === "ar" ? "إعادة تعيين" : "Reset"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 pt-2 border-t mt-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setIsCropperOpen(false)} 
                            className="cursor-pointer h-9 text-xs sm:text-sm"
                        >
                            {t.common.cancel}
                        </Button>
                        <Button 
                            size="sm"
                            onClick={handleCropApply} 
                            className="cursor-pointer font-bold px-5 h-9 text-xs sm:text-sm"
                        >
                            {language === "ar" ? "اعتماد" : "Apply"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
