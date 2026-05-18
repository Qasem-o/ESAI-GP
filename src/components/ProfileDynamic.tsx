import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { profileAPI, UserStats, Post as PostType, Follower } from "../services/profileApi";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DefaultAvatar } from "./DefaultAvatar";
import { useLanguage } from "../contexts/LanguageContext";
import {
    TrendingUp,
    User,
    Settings,
    Heart,
    MessageSquare,
    Share2,
    Bookmark,
    BarChart2,
    Target,
    Trophy,
    Award,
    Mail,
    CheckCircle,
    Loader2,
    Upload,
    Phone,
    Calendar,
    Eye,
    Clock,
    Trash2,
    X,
    Send,
    RotateCw
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { communityAPI, PostComment as CommentType } from "../services/communityApi";
import { PostCard } from "./PostCard";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { LoadingScreen } from "./LoadingScreen";
import { Label } from "./ui/label";
import "../styles/edit-profile.css";

interface NavigationProps {
    currentPage: string;
    onGoToHome: () => void;
    onGoToExplore: () => void;
    onGoToPortfolio: () => void;
    onGoToSimulator: () => void;
    onGoToProfile: () => void;
    onGoToSignup: () => void;
    onGoToLogin: () => void;
}

interface ProfileProps extends NavigationProps { }

import { API_BASE_URL as API_URL } from "../services/apiConfig";

export function Profile({ currentPage, onGoToHome, onGoToExplore, onGoToPortfolio, onGoToSimulator, onGoToProfile, onGoToSignup, onGoToLogin }: ProfileProps) {
    const { user: currentUser, isAuthenticated, isLoading: authLoading, logout, updateProfile } = useAuth();
    const { t, isRTL, language } = useLanguage();
    const { userId: urlUserId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"posts" | "portfolio" | "followers">("posts");
    
    // If urlUserId is present, we are viewing someone else. Otherwise, we view the logged-in user.
    const targetUserId = urlUserId ? parseInt(urlUserId) : currentUser?.user_id;
    const isEditingOwnProfile = !urlUserId || (currentUser && parseInt(urlUserId) === currentUser.user_id);

    // Data states
    const [stats, setStats] = useState<UserStats | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [following, setFollowing] = useState<Follower[]>([]);
    const [targetUser, setTargetUser] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Comments & SubTab states
    const [commentsPostId, setCommentsPostId] = useState<number | null>(null);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [commentText, setCommentText] = useState("");
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [subTab, setSubTab] = useState<"followers" | "following">("followers");

    // Edit profile states
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

    // Cropper modal states
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [cropperSrc, setCropperSrc] = useState("");
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgAspect, setImgAspect] = useState(1);

    // Fetch user data
    useEffect(() => {
        if (!authLoading && targetUserId) {
            fetchUserData();
        } else if (!authLoading && !targetUserId && !isAuthenticated) {
            onGoToLogin();
        }
    }, [authLoading, targetUserId, isAuthenticated]);

    const fetchUserData = async () => {
        if (!targetUserId) return;

        setIsLoadingData(true);
        try {
            // Using Promise.allSettled to prevent one failure from crashing the whole page
            const results = await Promise.allSettled([
                profileAPI.getUserStats(targetUserId),
                profileAPI.getUserPosts(targetUserId),
                profileAPI.getFollowers(targetUserId),
                profileAPI.getFollowing(targetUserId),
                urlUserId ? profileAPI.getUserById(targetUserId).catch(() => null) : null
            ]);

            if (results[0].status === 'fulfilled') setStats(results[0].value);
            if (results[1].status === 'fulfilled') setPosts(results[1].value);
            if (results[2].status === 'fulfilled') setFollowers(results[2].value);
            if (results[3].status === 'fulfilled') setFollowing(results[3].value);
            
            const userData = results[4].status === 'fulfilled' ? results[4].value : null;

            // If viewing someone else, we might need their basic user info too
            if (userData && urlUserId) {
                // Combine into a display user object
                setTargetUser(userData);
            } else if (!urlUserId && currentUser) {
                setTargetUser(currentUser);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Fetch comments hook
    useEffect(() => {
        const fetchComments = async () => {
            if (commentsPostId === null) return;
            setIsLoadingComments(true);
            try {
                const data = await communityAPI.getComments(commentsPostId);
                setComments(data);
            } catch (err) {
                console.error("Error fetching comments:", err);
            } finally {
                setIsLoadingComments(false);
            }
        };
        fetchComments();
    }, [commentsPostId]);

    const handleAddComment = async () => {
        if (!commentText.trim() || !commentsPostId || !isAuthenticated) return;
        try {
            const newComment = await communityAPI.createComment(commentsPostId, commentText.trim());
            setComments(prev => [...prev, newComment]);
            setCommentText("");
            setPosts(prev => prev.map(p =>
                p.post_id === commentsPostId ? { ...p, comments_count: p.comments_count + 1 } : p
            ));
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!commentsPostId || !isAuthenticated) return;
        try {
            await communityAPI.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.comment_id !== commentId));
            setPosts(prev => prev.map(p =>
                p.post_id === commentsPostId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
            ));
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    const toggleLike = async (postId: number) => {
        if (!isAuthenticated) return;
        try {
            const updated = await communityAPI.toggleLike(postId);
            setPosts(prev => prev.map(p =>
                p.post_id === postId ? { ...p, is_liked: updated.liked, likes_count: updated.likes_count } : p
            ));
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    const toggleBookmark = async (postId: number) => {
        if (!isAuthenticated) return;
        try {
            const updated = await communityAPI.toggleBookmark(postId);
            setPosts(prev => prev.map(p =>
                p.post_id === postId ? { ...p, is_bookmarked: updated.bookmarked } : p
            ));
        } catch (err) {
            console.error("Error toggling bookmark:", err);
        }
    };

    const handleSharePost = async (postId: number) => {
        const postUrl = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(postUrl);
            alert(language === "ar" ? "تم نسخ رابط المنشور إلى الحافظة!" : "Post link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const handleFollowToggle = async () => {
        if (!isAuthenticated || !currentUser) {
            navigate("/login");
            return;
        }
        if (!targetUserId || isEditingOwnProfile) return;
        const isFollowing = followers.some(f => f.user_id === currentUser.user_id);
        try {
            if (isFollowing) {
                await profileAPI.unfollowUser(targetUserId, currentUser.user_id);
                setFollowers(prev => prev.filter(f => f.user_id !== currentUser.user_id));
                setStats(prev => prev ? { ...prev, followers_count: Math.max(0, prev.followers_count - 1) } : null);
            } else {
                await profileAPI.followUser(targetUserId, currentUser.user_id);
                const newFollower: Follower = {
                    user_id: currentUser.user_id,
                    username: currentUser.username,
                    full_name: currentUser.full_name || "",
                    email: currentUser.email || "",
                    profile_picture_url: currentUser.profile_picture_url || "",
                    followers_count: 0,
                    is_verified: false
                };
                setFollowers(prev => [...prev, newFollower]);
                setStats(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null);
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
        }
    };

    const handleEditProfile = () => {
        setEditUsername(currentUser?.username || "");
        setEditFullName(currentUser?.full_name || "");
        setEditPhone(currentUser?.phone_number || "");
        setEditBio(currentUser?.bio || "");
        setAvatarPreview(currentUser?.profile_picture_url || "");
        setEditAvatarFile(null);
        setUsernameError("");
        setIsEditDialogOpen(true);
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
                // Landscape: fill height, scale width
                drawH = previewSize;
                drawW = previewSize * imgRatio;
            } else {
                // Portrait: fill width, scale height
                drawW = previewSize;
                drawH = previewSize / imgRatio;
            }

            // Apply scaling
            const finalW = drawW * zoom * scaleFactor;
            const finalH = drawH * zoom * scaleFactor;

            // Apply offset mapped to canvas coordinates
            const dx = offset.x * scaleFactor;
            const dy = offset.y * scaleFactor;

            // Draw image centered at origin
            ctx.drawImage(image, dx - finalW / 2, dy - finalH / 2, finalW, finalH);

            ctx.restore();

            // Convert canvas to Blob
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

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(language === "ar" ? "يجب أن يكون حجم الملف أقل من 10 ميجابايت" : "File size must be less than 10MB");
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert(language === "ar" ? "يُسمح فقط بصور JPG و PNG و GIF و WEBP" : "Only JPG, PNG, GIF, and WEBP images are allowed");
            return;
        }

        // Create reader to open crop editor modal
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

            // Upload avatar if file selected
            if (editAvatarFile) {
                avatarUrl = await uploadAvatar(editAvatarFile);
            }

            // Update profile using AuthContext (updates user state globally)
            await updateProfile({
                username: editUsername !== currentUser.username ? editUsername : undefined,
                full_name: editFullName !== currentUser.full_name ? editFullName : undefined,
                phone_number: editPhone || null,
                bio: editBio || null,
                profile_picture_url: avatarUrl
            } as any);

            // Close dialog and refresh data
            setIsEditDialogOpen(false);
            fetchUserData();
        } catch (error: any) {
            console.error("Error updating profile:", error);
            alert(error.message || (language === "ar" ? "فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى." : "Failed to update profile. Please try again."));
        } finally {
            setIsSaving(false);
        }
    };


    const formatJoinDate = (dateString: string) => {
        if (!dateString) return "...";
        const isoStr = dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;
        const date = new Date(isoStr);
        return date.toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' });
    };

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return "...";
        const isoStr = dateString.endsWith('Z') || dateString.includes('+') ? dateString : `${dateString}Z`;
        const date = new Date(isoStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);

        if (diffSecs < 5) return t.common.justNow;
        if (diffSecs < 60) return `${diffSecs}${t.common.secondsAgo}`;
        const diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return `${diffMins}${t.common.minutesAgo}`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}${t.common.hoursAgo}`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}${t.common.daysAgo}`;
        
        return date.toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US');
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            onGoToLogin();
        }
    }, [authLoading, isAuthenticated, onGoToLogin]);

    // Show loading state
    if (authLoading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground animate-pulse">{t.profile.loadingProfile}</p>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated || !currentUser) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardContent className="pt-6 text-center">
                        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">{t.auth.loginTitle}</h2>
                        <p className="text-muted-foreground mb-6">{t.portfolio.signInDesc}</p>
                        <Button onClick={onGoToLogin} className="w-full cursor-pointer">
                            {t.auth.loginTitle}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show data loading state only after auth is confirmed
    if (isLoadingData) {
        return (
            <LoadingScreen
                message={t.profile.loadingProfile}
                currentPage={currentPage}
                onGoToHome={onGoToHome}
                onGoToExplore={onGoToExplore}
                onGoToPortfolio={onGoToPortfolio}
                onGoToSimulator={onGoToSimulator}
                onGoToProfile={onGoToProfile}
                onGoToSignup={onGoToSignup}
                onGoToLogin={onGoToLogin}
            />
        );
    }

    // Trading stats for display
    const tradingStats = [
        { label: t.profile.tradesCount, value: stats?.total_trades?.toString() || "0", icon: Target },
        { label: t.profile.winRate, value: `${stats?.win_rate?.toFixed(0) || 0}%`, icon: Trophy },
        { label: language === "ar" ? "متوسط العائد" : "Avg Return", value: `+${stats?.avg_return?.toFixed(1) || 0}%`, icon: TrendingUp },
        { label: language === "ar" ? "أفضل صفقة" : "Best Trade", value: `+${stats?.best_trade?.toFixed(0) || 0}%`, icon: Award }
    ];

    return (
        <div className="bg-background min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
            <Header
                currentPage={currentPage}
                onGoToHome={onGoToHome}
                onGoToExplore={onGoToExplore}
                onGoToPortfolio={onGoToPortfolio}
                onGoToSimulator={onGoToSimulator}
                onGoToProfile={onGoToProfile}
                onGoToSignup={onGoToSignup}
                onGoToLogin={onGoToLogin}
            />

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-4 lg:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Profile Info */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardContent className="pt-6">
                                {/* Avatar */}
                                <div className="flex flex-col items-center text-center mb-6">
                                    {targetUser?.profile_picture_url ? (
                                        <img
                                            src={targetUser.profile_picture_url.startsWith('/') ? `${API_URL}${targetUser.profile_picture_url}` : targetUser.profile_picture_url}
                                            alt={targetUser?.username || "Avatar"}
                                            className="w-24 h-24 rounded-full mb-4 border-4 border-background shadow-lg object-cover"
                                        />
                                    ) : (
                                        <DefaultAvatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg" />
                                    )}
                                    <h2 className="text-2xl font-bold">{targetUser?.full_name || targetUser?.username || "..."}</h2>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <User className="w-4 h-4" />
                                        <p className="text-sm">@{targetUser?.username?.toLowerCase() || "username"}</p>
                                    </div>
                                    {targetUser?.phone_number && (
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                            <Phone className="w-4 h-4" />
                                            <p className="text-sm">{targetUser.phone_number}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary">
                                            {language === "ar" ? "متداول" : "Trader"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Bio */}
                                <p className="text-center mb-4 text-sm">
                                    {targetUser?.bio || t.profile.noBio}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{stats?.posts_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">{t.profile.posts}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{stats?.followers_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">{t.profile.followers}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{stats?.following_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">{t.profile.following}</p>
                                    </div>
                                </div>

                                {/* Joined Date */}
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Calendar className="w-4 h-4" />
                                    <span>{t.profile.joined} {targetUser?.created_at ? formatJoinDate(targetUser.created_at) : "..."}</span>
                                </div>

                                {/* Last Login */}
                                {targetUser?.last_login && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                                        <Eye className="w-3 h-3" />
                                        <span>{language === "ar" ? "آخر نشاط:" : "Last active:"} {new Date(targetUser.last_login).toLocaleDateString()}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-2">
                                    {isEditingOwnProfile && (
                                        <Button variant="outline" className="w-full cursor-pointer" onClick={handleEditProfile}>
                                            <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                            {t.profile.editProfile}
                                        </Button>
                                    )}
                                    {!isEditingOwnProfile && (
                                        <Button 
                                            variant={followers.some(f => f.user_id === currentUser?.user_id) ? "outline" : "default"} 
                                            className="w-full cursor-pointer"
                                            onClick={handleFollowToggle}
                                        >
                                            {followers.some(f => f.user_id === currentUser?.user_id) ? (language === "ar" ? "إلغاء المتابعة" : "Unfollow") : (language === "ar" ? "متابعة" : "Follow")}
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full cursor-pointer">
                                        <Share2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {language === "ar" ? "مشاركة الملف الشخصي" : "Share Profile"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trading Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t.profile.simulationPerformance}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {tradingStats.map((stat, i) => {
                                        const Icon = stat.icon;
                                        return (
                                            <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                                                <Icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                                                <p className="text-lg font-bold">{stat.value}</p>
                                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Portfolio Value */}
                                <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-lg p-4 border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">{t.portfolio.totalValue}</span>
                                        <Badge variant={stats && stats.portfolio_change >= 0 ? "default" : "destructive"}>
                                            {stats && stats.portfolio_change >= 0 ? '+' : ''}{stats?.portfolio_change?.toFixed(1) || 0}%
                                        </Badge>
                                    </div>
                                    <p className="text-3xl font-bold">${stats?.portfolio_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                                    <Button onClick={onGoToSimulator} variant="link" className="p-0 h-auto mt-2 text-primary cursor-pointer">
                                        {language === "ar" ? "عرض المحاكي الكامل ←" : "View Full Simulator →"}
                                    </Button>
                                </div>

                                {/* Win Rate Progress */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm">{t.profile.winRate}</span>
                                        <span className="text-sm font-bold">{stats?.win_rate?.toFixed(0) || 0}%</span>
                                    </div>
                                    <Progress value={stats?.win_rate || 0} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Center - Main Content */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Tabs */}
                        <Card>
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full" dir={isRTL ? "rtl" : "ltr"}>
                                    <TabsList className="w-full grid grid-cols-3">
                                        <TabsTrigger value="posts" className="cursor-pointer">{t.profile.posts}</TabsTrigger>
                                        <TabsTrigger value="portfolio" className="cursor-pointer">{t.nav.portfolio}</TabsTrigger>
                                        <TabsTrigger value="followers" className="cursor-pointer">{t.profile.followers}</TabsTrigger>
                                    </TabsList>

                                {/* Posts Tab */}
                                <TabsContent value="posts" className="space-y-4 p-4">
                                    {posts.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <h3 className="text-xl font-semibold mb-2">
                                                {language === "ar" ? "لا توجد منشورات بعد" : "No Posts Yet"}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {isEditingOwnProfile 
                                                    ? (language === "ar" ? "ابدأ بمشاركة رؤى التداول الخاصة بك!" : "Start sharing your trading insights!")
                                                    : (language === "ar" ? "لم يقم هذا المستخدم بنشر أي شيء بعد." : "This user hasn't posted anything yet.")}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="max-h-[70vh] overflow-y-auto pr-2 pl-1 custom-scrollbar space-y-4">
                                            {posts.map((post) => (
                                                <PostCard 
                                                    key={post.post_id}
                                                    post={{
                                                        ...post,
                                                        author: {
                                                            user_id: targetUserId,
                                                            username: targetUser?.username,
                                                            full_name: targetUser?.full_name,
                                                            profile_picture_url: targetUser?.profile_picture_url
                                                        }
                                                    }}
                                                    onLike={toggleLike}
                                                    onComment={setCommentsPostId}
                                                    onBookmark={toggleBookmark}
                                                    onShare={handleSharePost}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Portfolio Tab */}
                                <TabsContent value="portfolio" className="p-4">
                                    {isEditingOwnProfile ? (
                                        <div className="text-center py-12">
                                            <BarChart2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <h3 className="text-xl font-semibold mb-2">{language === "ar" ? "نظرة عامة على المحفظة" : "Portfolio Overview"}</h3>
                                            <p className="text-muted-foreground mb-4">{language === "ar" ? "اعرض محفظتك الكاملة وأصولك" : "View your complete portfolio and holdings"}</p>
                                            <Button onClick={onGoToPortfolio} className="cursor-pointer">
                                                {t.nav.portfolio}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <BarChart2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <h3 className="text-xl font-semibold mb-2">{language === "ar" ? "المحفظة مغلقة" : "Private Portfolio"}</h3>
                                            <p className="text-muted-foreground">{language === "ar" ? "هذه المحفظة خاصة بمالك الحساب فقط." : "This portfolio is private to the account owner."}</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Followers Tab */}
                                <TabsContent value="followers" className="space-y-3 p-4">
                                    <div className="flex gap-2 mb-4">
                                        <Button
                                            variant={subTab === "followers" ? "default" : "outline"}
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSubTab("followers")}
                                        >
                                            {t.profile.followers} ({stats?.followers_count || 0})
                                        </Button>
                                        <Button
                                            variant={subTab === "following" ? "default" : "outline"}
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSubTab("following")}
                                        >
                                            {t.profile.following} ({stats?.following_count || 0})
                                        </Button>
                                    </div>

                                    {subTab === "followers" ? (
                                        followers.length === 0 ? (
                                            <div className="text-center py-12">
                                                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                                <h3 className="text-xl font-semibold mb-2">
                                                    {language === "ar" ? "لا يوجد متابعون بعد" : "No Followers Yet"}
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {isEditingOwnProfile
                                                        ? (language === "ar" ? "ابدأ بمشاركة المحتوى لكسب المتابعين!" : "Start sharing content to gain followers!")
                                                        : (language === "ar" ? "لم يقم أي مستخدم بمتابعة هذا الحساب بعد." : "No one has followed this account yet.")}
                                                </p>
                                            </div>
                                        ) : (
                                            followers.map((follower) => {
                                                const fPicUrl = follower.profile_picture_url?.startsWith('/')
                                                    ? `${API_URL}${follower.profile_picture_url}`
                                                    : follower.profile_picture_url;
                                                return (
                                                    <Card key={follower.user_id}>
                                                        <CardContent className="pt-6">
                                                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={fPicUrl || ""} alt={follower.username} />
                                                                        <AvatarFallback className="w-full h-full bg-transparent" asChild>
                                                                            <DefaultAvatar />
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                                                        <span className="font-semibold">{follower.full_name || follower.username}</span>
                                                                        <p className="text-sm text-muted-foreground">@{follower.username.toLowerCase()}</p>
                                                                        <p className="text-xs text-muted-foreground">{follower.followers_count} {t.profile.followers}</p>
                                                                    </div>
                                                                </div>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    className="cursor-pointer"
                                                                    onClick={() => navigate(`/profile/${follower.user_id}`)}
                                                                >
                                                                    {language === "ar" ? "عرض الملف" : "View Profile"}
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })
                                        )
                                    ) : (
                                        following.length === 0 ? (
                                            <div className="text-center py-12">
                                                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                                <h3 className="text-xl font-semibold mb-2">
                                                    {isEditingOwnProfile 
                                                        ? (language === "ar" ? "لا تتابع أحداً بعد" : "Not Following Anyone Yet") 
                                                        : (language === "ar" ? "هذا المستخدم لا يتابع أحداً بعد." : "This user is not following anyone yet.")}
                                                </h3>
                                                {isEditingOwnProfile && (
                                                    <p className="text-muted-foreground">
                                                        {language === "ar" ? "اكتشف متداولين آخرين لتتابعهم!" : "Explore other traders to follow!"}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            following.map((followedUser) => {
                                                const fPicUrl = followedUser.profile_picture_url?.startsWith('/')
                                                    ? `${API_URL}${followedUser.profile_picture_url}`
                                                    : followedUser.profile_picture_url;
                                                return (
                                                    <Card key={followedUser.user_id}>
                                                        <CardContent className="pt-6">
                                                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={fPicUrl || ""} alt={followedUser.username} />
                                                                        <AvatarFallback className="w-full h-full bg-transparent" asChild>
                                                                            <DefaultAvatar />
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                                                        <span className="font-semibold">{followedUser.full_name || followedUser.username}</span>
                                                                        <p className="text-sm text-muted-foreground">@{followedUser.username.toLowerCase()}</p>
                                                                        <p className="text-xs text-muted-foreground">{followedUser.followers_count} {t.profile.followers}</p>
                                                                    </div>
                                                                </div>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    className="cursor-pointer"
                                                                    onClick={() => navigate(`/profile/${followedUser.user_id}`)}
                                                                >
                                                                    {language === "ar" ? "عرض الملف" : "View Profile"}
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })
                                        )
                                    )}
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent 
                    className="max-w-[92%] sm:max-w-[440px] max-h-[85vh] flex flex-col p-0 rounded-2xl shadow-2xl border border-muted/50 bg-background/95 backdrop-blur-md overflow-hidden" 
                    dir={isRTL ? "rtl" : "ltr"}
                >
                    <DialogHeader className={`p-6 pb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <DialogTitle>{t.profile.editProfile}</DialogTitle>
                        <DialogDescription>
                            {language === "ar" ? "قم بتحديث معلومات ملفك الشخصي. جميع الحقول اختيارية باستثناء اسم المستخدم." : "Update your profile information. All fields are optional except username."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 custom-scrollbar">
                        {/* Avatar Upload */}
                        <div className="space-y-2">
                            <Label className={isRTL ? 'text-right block' : 'block'}>{t.profile.changePicture}</Label>
                            <div className="flex items-center gap-4">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview.startsWith('/') ? `${API_URL}${avatarPreview}` : avatarPreview}
                                        alt="Preview"
                                        className="h-16 w-16 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border">
                                        <User className="w-8 h-8 text-primary" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-1">
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
                                        className="cursor-pointer text-xs sm:text-sm h-9"
                                    >
                                        <Upload className={`w-3.5 h-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                                        {editAvatarFile ? (language === "ar" ? 'تغيير الصورة' : 'Change Image') : (language === "ar" ? 'تحميل صورة' : 'Upload Image')}
                                    </Button>
                                    <p className={`text-[10px] text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {language === "ar" ? "الحد الأقصى 10 ميجابايت. JPG أو PNG أو GIF أو WEBP فقط." : "Max 10MB. JPG, PNG, GIF, or WEBP only."}
                                    </p>
                                    {isUploading && (
                                        <Progress value={uploadProgress} className="mt-2 h-1.5 w-full" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="editFullName" className={isRTL ? 'text-right block' : 'block'}>{language === "ar" ? "الاسم المعروض (الاسم الكامل)" : "Display Name (Full Name)"}</Label>
                            <Input
                                id="editFullName"
                                value={editFullName}
                                onChange={(e) => setEditFullName(e.target.value)}
                                placeholder="e.g. Ali Ahmed"
                                className={isRTL ? 'text-right' : ''}
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className={isRTL ? 'text-right block' : 'block'}>{t.auth.username} *</Label>
                            <Input
                                id="username"
                                value={editUsername}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                placeholder="Enter username"
                                required
                                className={isRTL ? 'text-right' : ''}
                            />
                            {usernameChecking && (
                                <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{language === "ar" ? "جاري التحقق من التوفر..." : "Checking availability..."}</p>
                            )}
                            {usernameError && (
                                <p className={`text-xs text-red-500 ${isRTL ? 'text-right' : ''}`}>{usernameError}</p>
                            )}
                            {!usernameError && editUsername && editUsername !== currentUser?.username && !usernameChecking && (
                                <p className={`text-xs text-green-500 ${isRTL ? 'text-right' : ''}`}>{language === "ar" ? "✓ اسم المستخدم متاح" : "✓ Username available"}</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className={isRTL ? 'text-right block' : 'block'}>{language === "ar" ? "رقم الهاتف" : "Phone Number"}</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="+1234567890"
                                className={isRTL ? 'text-right' : ''}
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio" className={isRTL ? 'text-right block' : 'block'}>{t.profile.bio}</Label>
                            <Textarea
                                id="bio"
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder={language === "ar" ? "أخبرنا قليلاً عن نفسك..." : "Tell us a bit about yourself..."}
                                className={`min-h-[100px] ${isRTL ? 'text-right' : ''}`}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 p-6 pt-2 border-t mt-2">
                        <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="cursor-pointer">
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving || !!usernameError || usernameChecking} className="cursor-pointer">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {t.profile.saveChanges}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
                        {/* Drag Container and Circular Mask - Guaranteed PERFECT CIRCLE & responsive */}
                        <div 
                            className="relative flex-shrink-0 rounded-full overflow-hidden border-4 border-primary/30 bg-muted/40 shadow-inner flex items-center justify-center cursor-move active:cursor-grabbing select-none aspect-square"
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
                            
                            {/* Visual Crop Guideline Circle */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary pointer-events-none ring-offset-4 ring-2 ring-background/50" style={{ borderRadius: '50%' }} />
                        </div>

                        {/* Zoom Slider */}
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

                        {/* Controls Toolbar (Rotate, Reset) */}
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

            <Footer />

            {/* Comments Modal */}
            {commentsPostId !== null && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => { setCommentsPostId(null); setComments([]); setCommentText(""); }}>
                    <div 
                        className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" 
                        onClick={(e) => e.stopPropagation()}
                        dir={isRTL ? "rtl" : "ltr"}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">{isRTL ? "التعليقات" : "Comments"}</h3>
                            <Button variant="ghost" size="icon" onClick={() => { setCommentsPostId(null); setComments([]); setCommentText(""); }}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoadingComments ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">
                                    {isRTL ? "لا توجد تعليقات بعد. كن أول من يعلق!" : "No comments yet. Be the first!"}
                                </p>
                            ) : (
                                comments.map((c) => {
                                    const cPicUrl = c.author.profile_picture_url?.startsWith('/')
                                        ? `${API_URL}${c.author.profile_picture_url}`
                                        : c.author.profile_picture_url;
                                    return (
                                        <div key={c.comment_id} className="flex gap-3">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage src={cPicUrl || ""} />
                                                <AvatarFallback className="w-full h-full bg-transparent" asChild>
                                                    <DefaultAvatar />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`flex-1 bg-muted/50 rounded-lg p-3 ${isRTL ? "text-right" : "text-left"} relative group`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{c.author.full_name || c.author.username}</span>
                                                        <span className="text-xs text-muted-foreground">@{c.author.username}</span>
                                                        <span className="text-xs text-muted-foreground">• {formatTimeAgo(c.created_at)}</span>
                                                    </div>
                                                    {isAuthenticated && currentUser && Number(c.author.user_id) === Number(currentUser.user_id) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer absolute top-2 ${isRTL ? "left-2" : "right-2"}`}
                                                            onClick={() => handleDeleteComment(c.comment_id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className={`text-sm ${isRTL ? "pl-6" : "pr-6"}`}>{c.content}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        {isAuthenticated && (
                            <div className="p-4 border-t flex gap-2">
                                <Textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder={isRTL ? "اكتب تعليقاً..." : "Write a comment..."}
                                    className="resize-none min-h-[40px] max-h-[120px] flex-1 py-2 px-3 text-sm"
                                    rows={1}
                                />
                                <Button onClick={handleAddComment} size="icon" className="shrink-0 cursor-pointer">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
