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
import { DefaultAvatar } from "./DefaultAvatar";
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
    Eye
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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

const API_URL = 'https://esai-backend.onrender.com';

export function Profile({ currentPage, onGoToHome, onGoToExplore, onGoToPortfolio, onGoToSimulator, onGoToProfile, onGoToSignup, onGoToLogin }: ProfileProps) {
    const { user: currentUser, isAuthenticated, isLoading: authLoading, logout, updateProfile } = useAuth();
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

    // Edit profile states
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editUsername, setEditUsername] = useState("");
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

    // Fetch user data
    useEffect(() => {
        if (!authLoading && targetUserId) {
            fetchUserData();
        }
    }, [authLoading, targetUserId]);

    const fetchUserData = async () => {
        if (!targetUserId) return;

        setIsLoadingData(true);
        try {
            const [statsData, postsData, followersData, followingData, userData] = await Promise.all([
                profileAPI.getUserStats(targetUserId),
                profileAPI.getUserPosts(targetUserId),
                profileAPI.getFollowers(targetUserId),
                profileAPI.getFollowing(targetUserId),
                urlUserId ? profileAPI.getUserById(targetUserId).catch(() => null) : null
            ]);

            setStats(statsData);
            setPosts(postsData);
            setFollowers(followersData);
            setFollowing(followingData);
            
            // If viewing someone else, we might need their basic user info too
            if (userData && urlUserId) {
                // Combine into a display user object
                setTargetUser(userData);
            } else if (!urlUserId) {
                setTargetUser(currentUser);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleEditProfile = () => {
        setEditUsername(user?.username || "");
        setEditPhone(user?.phone_number || "");
        setEditBio(user?.bio || "");
        setAvatarPreview(user?.profile_picture_url || "");
        setEditAvatarFile(null);
        setUsernameError("");
        setIsEditDialogOpen(true);
    };

    const checkUsernameAvailability = async (username: string) => {
        if (!username || username === user?.username) {
            setUsernameError("");
            return;
        }

        setUsernameChecking(true);
        try {
            const response = await fetch(`${API_URL}/auth/check-username/${username}`);
            const data = await response.json();

            if (!data.available) {
                setUsernameError("Username is already taken");
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("File size must be less than 10MB");
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, PNG, GIF, and WEBP images are allowed");
            return;
        }

        setEditAvatarFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
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
        if (!user) return;

        if (usernameError) {
            alert("Please fix errors before saving");
            return;
        }

        setIsSaving(true);
        try {
            let avatarUrl = user.profile_picture_url;

            // Upload avatar if file selected
            if (editAvatarFile) {
                avatarUrl = await uploadAvatar(editAvatarFile);
            }

            // Update profile using AuthContext (updates user state globally)
            await updateProfile({
                username: editUsername !== user.username ? editUsername : undefined,
                phone_number: editPhone || null,
                bio: editBio || null,
                profile_picture_url: avatarUrl
            } as any);

            // Close dialog and refresh data
            setIsEditDialogOpen(false);
            fetchUserData();
        } catch (error: any) {
            console.error("Error updating profile:", error);
            alert(error.message || "Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleLike = (postId: number) => {
        setPosts(posts.map(post => {
            if (post.post_id === postId) {
                return {
                    ...post,
                    is_liked: !post.is_liked,
                    likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
                };
            }
            return post;
        }));
    };

    const formatJoinDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            onGoToLogin();
        }
    }, [authLoading, isAuthenticated, onGoToLogin]);

    // Show loading state
    if (authLoading || isLoadingData) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardContent className="pt-6 text-center">
                        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
                        <p className="text-muted-foreground mb-6">You need to be logged in to view your profile.</p>
                        <Button onClick={onGoToLogin} className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Trading stats for display
    const tradingStats = [
        { label: "Total Trades", value: stats?.total_trades.toString() || "0", icon: Target },
        { label: "Win Rate", value: `${stats?.win_rate.toFixed(0) || 0}%`, icon: Trophy },
        { label: "Avg Return", value: `+${stats?.avg_return.toFixed(1) || 0}%`, icon: TrendingUp },
        { label: "Best Trade", value: `+${stats?.best_trade.toFixed(0) || 0}%`, icon: Award }
    ];

    return (
        <div className="bg-background min-h-screen">
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
            <div className="container mx-auto px-4 lg:px-6 py-6">
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
                                            alt={targetUser.username}
                                            className="w-24 h-24 rounded-full mb-4 border-4 border-background shadow-lg object-cover"
                                        />
                                    ) : (
                                        <DefaultAvatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg" />
                                    )}
                                    <h2 className="text-2xl font-bold">{targetUser?.username || "Loading..."}</h2>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <Mail className="w-4 h-4" />
                                        <p className="text-sm">{targetUser?.email}</p>
                                    </div>
                                    {targetUser?.phone_number && (
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                            <Phone className="w-4 h-4" />
                                            <p className="text-sm">{targetUser.phone_number}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary">
                                            {targetUser?.is_verified ? "Verified Trader" : "Trader"}
                                        </Badge>
                                        {targetUser?.is_verified && (
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {targetUser?.bio && (
                                    <p className="text-center mb-4 text-sm">{targetUser.bio}</p>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{stats?.posts_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">Posts</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{stats?.followers_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">Followers</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{stats?.following_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">Following</p>
                                    </div>
                                </div>

                                {/* Joined Date */}
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {targetUser?.created_at ? formatJoinDate(targetUser.created_at) : "Loading..."}</span>
                                </div>

                                {/* Last Login */}
                                {targetUser?.last_login && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                                        <Eye className="w-3 h-3" />
                                        <span>Last active: {new Date(targetUser.last_login).toLocaleDateString()}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-2">
                                    {isEditingOwnProfile && (
                                        <Button variant="outline" className="w-full" onClick={handleEditProfile}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    )}
                                    {!isEditingOwnProfile && (
                                        <Button 
                                            variant={followers.some(f => f.user_id === currentUser?.user_id) ? "outline" : "default"} 
                                            className="w-full"
                                            onClick={() => {/* handle follow */}}
                                        >
                                            {followers.some(f => f.user_id === currentUser?.user_id) ? "Unfollow" : "Follow"}
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trading Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Trading Performance</CardTitle>
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
                                        <span className="text-sm text-muted-foreground">Portfolio Value</span>
                                        <Badge variant={stats && stats.portfolio_change >= 0 ? "default" : "destructive"}>
                                            {stats && stats.portfolio_change >= 0 ? '+' : ''}{stats?.portfolio_change.toFixed(1) || 0}%
                                        </Badge>
                                    </div>
                                    <p className="text-3xl font-bold">${stats?.portfolio_value.toLocaleString() || '0'}</p>
                                    <Button onClick={onGoToPortfolio} variant="link" className="p-0 h-auto mt-2 text-primary">
                                        View Full Portfolio →
                                    </Button>
                                </div>

                                {/* Win Rate Progress */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm">Win Rate</span>
                                        <span className="text-sm font-bold">{stats?.win_rate.toFixed(0) || 0}%</span>
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
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                <TabsList className="w-full grid grid-cols-3">
                                    <TabsTrigger value="posts">Posts</TabsTrigger>
                                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                                    <TabsTrigger value="followers">Followers</TabsTrigger>
                                </TabsList>

                                {/* Posts Tab */}
                                <TabsContent value="posts" className="space-y-4 p-4">
                                    {posts.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                                            <p className="text-muted-foreground">Start sharing your trading insights!</p>
                                        </div>
                                    ) : (
                                        posts.map((post) => (
                                            <Card key={post.post_id}>
                                                <CardContent className="pt-6">
                                                    {/* Post Header */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-start gap-3">
                                                            {targetUser?.profile_picture_url ? (
                                                                <img
                                                                    src={targetUser.profile_picture_url.startsWith('/') ? `${API_URL}${targetUser.profile_picture_url}` : targetUser.profile_picture_url}
                                                                    alt={targetUser.username}
                                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <User className="w-6 h-6 text-primary" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold">{targetUser?.username}</span>
                                                                    {targetUser?.is_verified && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                            Verified
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Post Content */}
                                                    <div className="mb-3">
                                                        <p className="whitespace-pre-wrap mb-3">{post.content}</p>

                                                        {/* Stock Symbol if attached */}
                                                        {post.stock_symbol && (
                                                            <div className="bg-muted/50 rounded-lg p-4 border">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-bold text-lg">${post.stock_symbol}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Post Stats */}
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 pb-3 border-b">
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            {post.views_count.toLocaleString()} views
                                                        </span>
                                                        <span>{post.comments_count} comments</span>
                                                    </div>

                                                    {/* Post Actions */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleLike(post.post_id)}
                                                                className={post.is_liked ? "text-red-500" : ""}
                                                            >
                                                                <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-red-500' : ''}`} />
                                                                {post.likes_count}
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                                {post.comments_count}
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Share2 className="w-4 h-4 mr-1" />
                                                                {post.shares_count}
                                                            </Button>
                                                        </div>
                                                        <Button variant="ghost" size="sm">
                                                            <Bookmark className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>

                                {/* Portfolio Tab */}
                                <TabsContent value="portfolio" className="p-4">
                                    <div className="text-center py-12">
                                        <BarChart2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                        <h3 className="text-xl font-semibold mb-2">Portfolio Overview</h3>
                                        <p className="text-muted-foreground mb-4">View your complete portfolio and holdings</p>
                                        <Button onClick={onGoToPortfolio}>
                                            Go to Portfolio
                                        </Button>
                                    </div>
                                </TabsContent>

                                {/* Followers Tab */}
                                <TabsContent value="followers" className="space-y-3 p-4">
                                    <div className="flex gap-2 mb-4">
                                        <Button
                                            variant={activeTab === "followers" ? "default" : "outline"}
                                            className="flex-1"
                                            onClick={() => setActiveTab("followers")}
                                        >
                                            Followers ({stats?.followers_count || 0})
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Following ({stats?.following_count || 0})
                                        </Button>
                                    </div>

                                    {followers.length === 0 ? (
                                        <div className="text-center py-12">
                                            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <h3 className="text-xl font-semibold mb-2">No Followers Yet</h3>
                                            <p className="text-muted-foreground">Start sharing content to gain followers!</p>
                                        </div>
                                    ) : (
                                        followers.map((follower) => (
                                            <Card key={follower.user_id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {follower.profile_picture_url ? (
                                                                <img
                                                                    src={follower.profile_picture_url}
                                                                    alt={follower.username}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                                                                    <User className="w-7 h-7 text-primary" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold">{follower.username}</span>
                                                                    {follower.is_verified && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                            Verified
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{follower.email}</p>
                                                                <p className="text-xs text-muted-foreground">{follower.followers_count} followers</p>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => navigate(`/profile/${follower.user_id}`)}
                                                        >
                                                            View Profile
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Update your profile information. All fields are optional except username.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Avatar Upload */}
                        <div className="space-y-2">
                            <Label>Profile Picture</Label>
                            <div className="flex items-center gap-4">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview.startsWith('/') ? `${API_URL}${avatarPreview}` : avatarPreview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-full object-cover border-2"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border-2">
                                        <User className="w-12 h-12 text-primary" />
                                    </div>
                                )}
                                <div className="flex-1">
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
                                        className="w-full"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {editAvatarFile ? 'Change Image' : 'Upload Image'}
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Max 10MB. JPG, PNG, GIF, or WEBP only.
                                    </p>
                                    {isUploading && (
                                        <Progress value={uploadProgress} className="mt-2" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username">Username *</Label>
                            <Input
                                id="username"
                                value={editUsername}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                            {usernameChecking && (
                                <p className="text-xs text-muted-foreground">Checking availability...</p>
                            )}
                            {usernameError && (
                                <p className="text-xs text-red-500">{usernameError}</p>
                            )}
                            {!usernameError && editUsername && editUsername !== user?.username && !usernameChecking && (
                                <p className="text-xs text-green-500">✓ Username available</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="+1234567890"
                            />
                            <p className="text-xs text-muted-foreground">
                                International format recommended
                            </p>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about yourself..."
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground">
                                {editBio.length}/500 characters
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={isSaving || isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving || isUploading || !!usernameError || !editUsername}
                        >
                            {isSaving || isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isUploading ? 'Uploading...' : 'Saving...'}
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
