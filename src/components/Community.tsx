import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Header } from "./Header";
import { useAuth } from "../contexts/AuthContext";
import { communityAPI, FeedPost, TopTrader, PostComment as CommentType } from "../services/communityApi";
import { DefaultAvatar } from "./DefaultAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  AlertCircle
} from "lucide-react";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 5) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface NavigationProps {
  currentPage: string;
  onGoToHome: () => void;
  onGoToStocks: () => void;
  onGoToPortfolio: () => void;
  onGoToCommunity: () => void;
  onGoToNews: () => void;
  onGoToLearn: () => void;
  onGoToSimulator: () => void;
  onGoToProfile: () => void;
  onGoToSignup?: () => void;
  onGoToLogin?: () => void;
}

interface CommunityProps extends NavigationProps { }

export function Community({ currentPage, onGoToHome, onGoToStocks, onGoToPortfolio, onGoToCommunity, onGoToNews, onGoToLearn, onGoToSimulator, onGoToProfile, onGoToSignup, onGoToLogin }: CommunityProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!isAuthenticated) return;
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

  const renderPost = (post: FeedPost) => {
    const isOwnPost = user && Number(post.author.user_id) === Number((user as any).user_id);
    const profilePicUrl = post.author.profile_picture_url?.startsWith('/')
      ? `https://esai-firstdraft.onrender.com${post.author.profile_picture_url}`
      : post.author.profile_picture_url;
    
    const isDeleting = deletingPostId === post.post_id;

    return (
      <Card key={post.post_id} className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profilePicUrl || ""} alt={post.author.username} />
                <AvatarFallback className="w-full h-full bg-transparent" asChild>
                  <DefaultAvatar />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="font-semibold cursor-pointer hover:underline hover:text-primary transition-colors"
                    onClick={() => navigate(`/profile/${post.author.user_id}`)}
                  >
                    {post.author.full_name || post.author.username}
                  </span>
                  <span className="text-xs text-muted-foreground">@{post.author.username}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(post.created_at)}
                  </span>
                </div>
              </div>
            </div>
            {isOwnPost && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" 
                onClick={() => handleDeletePost(post.post_id)}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="whitespace-pre-wrap mb-3">{post.content}</p>

            {/* Stock Card if attached */}
            {post.stock && (
              <div 
                className="bg-primary/5 hover:bg-primary/10 rounded-xl p-4 border border-primary/10 transition-all cursor-pointer group"
                onClick={() => navigate(`/stock/${post.stock?.symbol}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border font-bold text-primary">
                      {post.stock.symbol[0]}
                    </div>
                    <div>
                      <p className="font-bold group-hover:text-primary transition-colors">{post.stock.symbol}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{post.stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${(post.stock.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-primary flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" />
                      View Analytics
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleLike(post.post_id)}
                className={`cursor-pointer ${post.is_liked ? "text-red-500" : ""}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-red-500' : ''}`} />
                {post.likes_count}
              </Button>
              <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => openComments(post.post_id)}>
                <MessageSquare className="w-4 h-4 mr-1" />
                {post.comments_count}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleBookmark(post.post_id)}
              className={`cursor-pointer ${post.is_bookmarked ? "text-primary" : ""}`}
            >
              <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-primary' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage === "home" ? "home" : currentPage}
        onGoToHome={onGoToHome}
        onGoToExplore={onGoToStocks}
        onGoToPortfolio={onGoToPortfolio}
        onGoToSimulator={onGoToSimulator}
        onGoToProfile={onGoToProfile}
        onGoToSignup={onGoToSignup}
        onGoToLogin={onGoToLogin}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={onGoToSimulator} variant="outline" className="w-full justify-start cursor-pointer">
                  <Zap className="w-4 h-4 mr-2" />
                  Practice Trading
                </Button>
                <Button onClick={onGoToStocks} variant="outline" className="w-full justify-start cursor-pointer">
                  <Target className="w-4 h-4 mr-2" />
                  Explore Stocks
                </Button>
                <Button onClick={onGoToPortfolio} variant="outline" className="w-full justify-start cursor-pointer">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  View Portfolio
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Traders</span>
                  <span className="font-semibold">{topTraders.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-6 space-y-4">
            {/* Post Composer */}
            {isAuthenticated && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profile_picture_url?.startsWith('/')
                          ? `https://esai-firstdraft.onrender.com${user.profile_picture_url}`
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
                            className="w-full text-left text-muted-foreground bg-muted/30 px-3 py-2.5 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            Share your trading idea or market analysis...
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Share your trading idea or market analysis..."
                              value={postContent}
                              onChange={(e) => setPostContent(e.target.value)}
                              autoFocus
                              className="border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20 resize-none p-3 min-h-[100px] text-base"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Attach stock symbol (optional, e.g. AAPL)"
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
                                  {isPostLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
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
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all" className="cursor-pointer">
                  All Posts
                </TabsTrigger>
                <TabsTrigger value="trending" className="cursor-pointer">
                  <Flame className="w-4 h-4 mr-1" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="following" className="cursor-pointer">
                  <Users className="w-4 h-4 mr-1" />
                  Following
                </TabsTrigger>
              </TabsList>

              {/* Posts Feed */}
              <TabsContent value="all" className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to share your trading insights!
                    </p>
                    {!isAuthenticated && (
                      <Button onClick={onGoToLogin} className="cursor-pointer">Sign In to Post</Button>
                    )}
                  </Card>
                ) : (
                  posts.map(post => renderPost(post))
                )}
              </TabsContent>

              <TabsContent value="trending" className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Flame className="w-16 h-16 mx-auto mb-4 text-orange-500 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Trending Posts</h3>
                    <p className="text-muted-foreground">Start liking posts to see trends!</p>
                  </Card>
                ) : (
                  posts.map(post => renderPost(post))
                )}
              </TabsContent>

              <TabsContent value="following" className="mt-4 space-y-4">
                {!isAuthenticated ? (
                  <Card className="p-8 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-4">Sign in to see posts from people you follow.</p>
                    <Button onClick={onGoToLogin} className="cursor-pointer">Sign In</Button>
                  </Card>
                ) : isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Posts from Following</h3>
                    <p className="text-muted-foreground">Follow traders to see their posts here!</p>
                  </Card>
                ) : (
                  posts.map(post => renderPost(post))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Top Traders */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Traders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Top Traders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topTraders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No traders yet</p>
                ) : (
                  topTraders.map((trader) => {
                    const traderPicUrl = trader.profile_picture_url?.startsWith('/')
                      ? `https://esai-firstdraft.onrender.com${trader.profile_picture_url}`
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
                          <div>
                            <p className="font-semibold text-sm">{trader.full_name || trader.username}</p>
                            <p className="text-xs text-muted-foreground">
                              @{trader.username.toLowerCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {trader.followers_count} followers • {trader.posts_count} posts
                            </p>
                          </div>
                        </div>
                        {isAuthenticated && user && (user as any).user_id !== trader.user_id && (
                          <Button
                            size="sm"
                            variant={trader.is_following ? "secondary" : "outline"}
                            className="text-xs cursor-pointer"
                            onClick={() => handleToggleFollow(trader.user_id)}
                          >
                            {trader.is_following ? "Following" : "Follow"}
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-xs text-muted-foreground space-y-2 px-2">
              <div className="flex flex-wrap gap-2">
                <a href="#" className="hover:underline">About</a>
                <span>•</span>
                <a href="#" className="hover:underline">Terms</a>
                <span>•</span>
                <a href="#" className="hover:underline">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:underline">Help</a>
              </div>
              <p>© 2025 EyeStocks AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {commentsPostId !== null && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => { setCommentsPostId(null); setComments([]); setCommentText(""); }}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Comments</h3>
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
                <p className="text-center text-muted-foreground py-10">No comments yet. Be the first!</p>
              ) : (
                comments.map((c) => {
                  const cPicUrl = c.author.profile_picture_url?.startsWith('/')
                    ? `https://esai-firstdraft.onrender.com${c.author.profile_picture_url}`
                    : c.author.profile_picture_url;
                  return (
                    <div key={c.comment_id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={cPicUrl || ""} />
                        <AvatarFallback className="w-full h-full bg-transparent" asChild>
                          <DefaultAvatar />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{c.author.full_name || c.author.username}</span>
                          <span className="text-xs text-muted-foreground">@{c.author.username}</span>
                          <span className="text-xs text-muted-foreground">• {timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    </div>
                  );
                })
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
