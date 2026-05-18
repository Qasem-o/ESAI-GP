import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import { communityAPI, FeedPost, TopTrader, PostComment as CommentType } from "../services/communityApi";
import { DefaultAvatar } from "./DefaultAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useLanguage } from "../contexts/LanguageContext";
import {
  TrendingUp,
  TrendingDown,
  User,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  BarChart2,
  Clock,
  Flame,
  Award,
  Target,
  Zap,
  Users,
  Loader2,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { PostCard } from "./PostCard";
import { EducationalSidebar } from "./EducationalSidebar";
import { LoadingScreen } from "./LoadingScreen";

function timeAgo(dateStr: string, t: any): string {
  // Ensure the date is treated as UTC if no timezone is provided
  const isoStr = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
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
  
  // Use a more robust date format that doesn't flip in RTL browsers
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

interface NavigationProps {
  currentPage: string;
  onGoToHome: () => void;
  onGoToStocks: () => void;
  onGoToPortfolio: () => void;
  onGoToCommunity: () => void;

  onGoToSimulator: () => void;
  onGoToProfile: () => void;
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
  onGoToAdmin?: () => void;
}

interface CommunityProps extends NavigationProps { }

export function Community({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToSimulator, onGoToProfile, onGoToSignup, onGoToLogin, onGoToAdmin }: CommunityProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "trending" | "following">("all");

  const [postContent, setPostContent] = useState("");
  const [postStock, setPostStock] = useState("");
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  // Comments modal
  const [commentsPostId, setCommentsPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);


  const fetchFeed = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [feedData, tradersData] = await Promise.all([
        communityAPI.getFeed(1, 30, activeFilter),
        communityAPI.getTopTraders().catch(() => []),
      ]);
      setPosts(feedData);
      setTopTraders(tradersData);
    } catch (err) {
      console.error("Failed to load feed", err);
    } finally {
      if (!silent) setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchFeed(true), 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  const handleCreatePost = async () => {
    if (!postContent.trim() || !isAuthenticated) return;
    setIsPostLoading(true);
    try {
      await communityAPI.createPost(postContent.trim(), postStock.trim() || undefined);
      setPostContent("");
      setPostStock("");
      setIsInputExpanded(false);
      await fetchFeed(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsPostLoading(false);
    }
  };

  const handleToggleLike = async (postId: number) => {
    if (!isAuthenticated) return;
    try {
      const res = await communityAPI.toggleLike(postId);
      setPosts(prev => prev.map(p =>
        p.post_id === postId ? { ...p, is_liked: res.liked, likes_count: res.likes_count } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (postId: number) => {
    if (!isAuthenticated) return;
    try {
      const res = await communityAPI.toggleBookmark(postId);
      setPosts(prev => prev.map(p =>
        p.post_id === postId ? { ...p, is_bookmarked: res.bookmarked } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeletingPostId(postId);
    try {
      await communityAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p.post_id !== postId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete post. Make sure you are the author.");
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleToggleFollow = async (targetUserId: number) => {
    if (!isAuthenticated) {
      if (onGoToLogin) onGoToLogin();
      else navigate("/login");
      return;
    }
    try {
      const res = await communityAPI.toggleFollow(targetUserId);
      setTopTraders(prev => prev.map(t =>
        t.user_id === targetUserId ? {
          ...t,
          is_following: res.following,
          followers_count: res.following ? t.followers_count + 1 : Math.max(0, t.followers_count - 1)
        } : t
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const openComments = async (postId: number) => {
    setCommentsPostId(postId);
    setIsLoadingComments(true);
    try {
      const data = await communityAPI.getComments(postId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !commentsPostId || !isAuthenticated) return;
    try {
      const newComment = await communityAPI.createComment(commentsPostId, commentText.trim());
      setComments(prev => [...prev, newComment]);
      setCommentText("");
      // Update comment count in feed
      setPosts(prev => prev.map(p =>
        p.post_id === commentsPostId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!commentsPostId || !isAuthenticated) return;
    try {
      await communityAPI.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
      // Update comment count in feed
      setPosts(prev => prev.map(p =>
        p.post_id === commentsPostId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
      ));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleSharePost = async (postId: number) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      alert(isRTL ? "تم نسخ رابط المنشور!" : "Post link copied!");
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (isInitialLoading) {
    return (
      <LoadingScreen
        message={isRTL ? "جاري تحميل الصفحة الرئيسية..." : "Loading home page..."}
        currentPage={currentPage === "home" ? "home" : currentPage}
        onGoToHome={onGoToHome}
        onGoToExplore={onGoToStocks}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
        onGoToSignup={onGoToSignup}
        onGoToLogin={onGoToLogin}
        onGoToAdmin={onGoToAdmin}
      />
    );
  }

  const renderPost = (post: FeedPost) => {
    return (
      <PostCard
        key={post.post_id}
        post={post}
        onLike={handleToggleLike}
        onComment={openComments}
        onBookmark={handleToggleBookmark}
        onDelete={handleDeletePost}
        onShare={handleSharePost}
        isDeleting={deletingPostId === post.post_id}
      />
    );
  };

  return (
    <div className="layout-shell bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-50">
        <Header
          currentPage={currentPage === "home" ? "home" : currentPage}
          onGoToHome={onGoToHome}
          onGoToExplore={onGoToStocks}
          onGoToPortfolio={onGoToPortfolio}
          onGoToSimulator={onGoToSimulator}
          onGoToProfile={onGoToProfile}
          onGoToSignup={onGoToSignup}
          onGoToLogin={onGoToLogin}
          onGoToAdmin={onGoToAdmin}
        />
      </div>

      {/* Main Content */}
      <div className="layout-main container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start layout-grid">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6 layout-sticky-sidebar">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  {t.community.quickActions}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={onGoToSimulator} variant="outline" className={`w-full ${isRTL ? 'justify-end text-right' : 'justify-start text-left'} cursor-pointer`}>
                  {!isRTL && <Zap className="w-4 h-4 mr-2" />}
                  {t.community.practiceTrading}
                  {isRTL && <Zap className="w-4 h-4 ml-2" />}
                </Button>
                <Button onClick={onGoToStocks} variant="outline" className={`w-full ${isRTL ? 'justify-end text-right' : 'justify-start text-left'} cursor-pointer`}>
                  {!isRTL && <Target className="w-4 h-4 mr-2" />}
                  {t.community.exploreStocks}
                  {isRTL && <Target className="w-4 h-4 ml-2" />}
                </Button>
                <Button onClick={onGoToPortfolio} variant="outline" className={`w-full ${isRTL ? 'justify-end text-right' : 'justify-start text-left'} cursor-pointer`}>
                  {!isRTL && <BarChart2 className="w-4 h-4 mr-2" />}
                  {t.community.viewPortfolio}
                  {isRTL && <BarChart2 className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                  {t.community.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.community.totalPosts}</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.community.activeTraders}</span>
                  <span className="font-semibold">{topTraders.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-6 flex flex-col min-h-0 gap-4">
            {/* Post Composer */}
            {isAuthenticated && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profile_picture_url?.startsWith('/')
                          ? `https://esai-firstdraft-production.up.railway.app${user.profile_picture_url}`
                          : (user?.profile_picture_url || "")}
                        alt={user?.username}
                      />
                      <AvatarFallback className="w-full h-full bg-transparent" asChild>
                        <DefaultAvatar />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className={`transition-all duration-300 ${isInputExpanded ? 'min-h-[140px]' : 'min-h-[40px]'}`}>
                        {!isInputExpanded && !postContent ? (
                          <button
                            onClick={() => setIsInputExpanded(true)}
                            className="w-full text-left rtl:text-right text-muted-foreground bg-muted/30 px-3 py-2.5 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            {t.community.shareIdea}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <Textarea
                              placeholder={t.community.shareIdea}
                              value={postContent}
                              onChange={(e) => setPostContent(e.target.value)}
                              autoFocus
                              className="border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20 resize-none p-3 min-h-[100px] text-base"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder={t.community.attachStock}
                                value={postStock}
                                onChange={(e) => setPostStock(e.target.value.toUpperCase())}
                                className="flex-1 px-3 py-1.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div />
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setIsInputExpanded(false);
                                    setPostContent("");
                                    setPostStock("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleCreatePost}
                                  disabled={!postContent.trim() || isPostLoading}
                                  size="sm"
                                  className="px-6 cursor-pointer"
                                >
                                  {isPostLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.community.post}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)} className="w-full flex flex-col min-h-0 flex-1" dir={isRTL ? "rtl" : "ltr"}>
              <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 mb-6 overflow-x-auto no-scrollbar">
                <TabsTrigger value="all" className="cursor-pointer">
                  {t.community.allPosts}
                </TabsTrigger>
                <TabsTrigger value="trending" className="cursor-pointer">
                  <Flame className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t.community.trending}
                </TabsTrigger>
                <TabsTrigger value="following" className="cursor-pointer">
                  <Users className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t.community.following}
                </TabsTrigger>
              </TabsList>

              {/* Posts Feed */}
              <TabsContent value="all" className="mt-4 flex flex-col min-h-0 flex-1">
                {isLoading ? (
                  <div className="flex justify-center py-20 flex-1">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="p-8 text-center flex-1">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">{t.community.noPosts}</h3>
                    <p className="text-muted-foreground mb-4">
                      {isRTL ? "كن أول من يشارك رؤيته في السوق!" : "Be the first to share your trading insights!"}
                    </p>
                    {!isAuthenticated && (
                      <Button onClick={onGoToLogin} className="cursor-pointer">{t.community.signInToPost}</Button>
                    )}
                  </Card>
                ) : (
                  <div className="posts-scroll-area flex-1 space-y-4">
                    {posts.map(post => renderPost(post))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="mt-4 flex flex-col min-h-0 flex-1">
                {isLoading ? (
                  <div className="flex justify-center py-20 flex-1">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="p-8 text-center flex-1">
                    <Flame className="w-16 h-16 mx-auto mb-4 text-orange-500 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">{t.community.noTrendingPosts}</h3>
                    <p className="text-muted-foreground">{isRTL ? "ابدأ بالإعجاب بالمنشورات لرؤية الرائج!" : "Start liking posts to see trends!"}</p>
                  </Card>
                ) : (
                  <div className="posts-scroll-area flex-1 space-y-4">
                    {posts.map(post => renderPost(post))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="following" className="mt-4 flex flex-col min-h-0 flex-1">
                {!isAuthenticated ? (
                  <Card className="p-8 text-center flex-1">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">{t.community.signInRequired}</h3>
                    <p className="text-muted-foreground mb-4">{t.community.signInToFollow}</p>
                    <Button onClick={onGoToLogin} className="cursor-pointer">{t.nav.login}</Button>
                  </Card>
                ) : isLoading ? (
                  <div className="flex justify-center py-20 flex-1">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="p-8 text-center flex-1">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">{t.community.noFollowingPosts}</h3>
                    <p className="text-muted-foreground">{isRTL ? "تابع متداولين لعرض منشوراتهم هنا!" : "Follow traders to see their posts here!"}</p>
                  </Card>
                ) : (
                  <div className="posts-scroll-area flex-1 space-y-4">
                    {posts.map(post => renderPost(post))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Top Traders & Learning */}
          <div className="lg:col-span-3 space-y-6 layout-sticky-sidebar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-yellow-500" />
                  {t.community.topTraders}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topTraders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No traders yet</p>
                ) : (
                  topTraders.map((trader) => {
                    const traderPicUrl = trader.profile_picture_url?.startsWith('/')
                      ? `https://esai-firstdraft-production.up.railway.app${trader.profile_picture_url}`
                      : trader.profile_picture_url;

                    return (
                      <div key={trader.user_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={traderPicUrl || ""} alt={trader.username} />
                            <AvatarFallback className="w-full h-full bg-transparent" asChild>
                              <DefaultAvatar />
                            </AvatarFallback>
                          </Avatar>
                          <div className={isRTL ? "text-right" : "text-left"}>
                            <p className="font-semibold text-sm">{trader.full_name || trader.username}</p>
                            <p className="text-xs text-muted-foreground">
                              @{trader.username.toLowerCase()}
                            </p>
                            <p className="text-xs font-semibold text-green-500 mt-1">
                              {t.community.virtualValue}: ${trader.portfolio_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </p>
                          </div>
                        </div>
                        {(!isAuthenticated || (user && (user as any).user_id !== trader.user_id)) && (
                          <Button
                            size="sm"
                            variant={trader.is_following ? "secondary" : "outline"}
                            className="text-xs cursor-pointer"
                            onClick={() => handleToggleFollow(trader.user_id)}
                          >
                            {trader.is_following ? t.community.following_btn : t.community.follow}
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <EducationalSidebar />

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
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
              ) : (
                Array.isArray(comments) && comments.map((c) => {
                  const cPicUrl = c.author.profile_picture_url?.startsWith('/')
                    ? `https://esai-firstdraft-production.up.railway.app${c.author.profile_picture_url}`
                    : c.author.profile_picture_url;
                  return (
                    <div key={c.comment_id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={cPicUrl || ""} alt={c.author.username} />
                        <AvatarFallback className="w-full h-full bg-transparent" asChild>
                          <DefaultAvatar />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex flex-wrap items-center gap-x-2 min-w-0 ${isRTL ? 'text-right justify-start' : 'text-left justify-start'}`}>
                            <span className="font-semibold text-sm truncate max-w-[120px]">{c.author.full_name || c.author.username}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">@{c.author.username}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">• {timeAgo(c.created_at, t)}</span>
                          </div>
                          {user && (Number((user as any).user_id) === Number(c.author.user_id)) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer flex-shrink-0"
                              onClick={() => handleDeleteComment(c.comment_id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className={`text-sm mt-1 whitespace-pre-wrap ${isRTL ? 'text-right' : 'text-left'}`}>{c.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              {!isLoadingComments && comments.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                  {isRTL ? "لا توجد تعليقات بعد. كن أول من يعلق!" : "No comments yet. Be the first!"}
                </p>
              )}
            </div>

            {/* Comment Input */}
            {isAuthenticated && (
              <div className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim()} className="cursor-pointer">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
