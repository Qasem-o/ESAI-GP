import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DefaultAvatar } from "./DefaultAvatar";
import { 
  Clock, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Trash2, 
  Loader2, 
  TrendingUp,
  Share2
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

interface PostCardProps {
  post: any;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onShare?: (postId: number) => void;
  isDeleting?: boolean;
}

export function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onBookmark, 
  onDelete, 
  onShare,
  isDeleting 
}: PostCardProps) {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwnPost = user && Number(post.author.user_id) === Number((user as any).user_id);
  
  const profilePicUrl = post.author.profile_picture_url?.startsWith('/')
    ? `https://esai-firstdraft-production.up.railway.app${post.author.profile_picture_url}`
    : post.author.profile_picture_url;

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "...";
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
    
    return date.toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        {/* Post Header */}
        <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${post.author.user_id}`)}>
              <AvatarImage src={profilePicUrl || ""} alt={post.author.username} />
              <AvatarFallback className="w-full h-full bg-transparent" asChild>
                <DefaultAvatar />
              </AvatarFallback>
            </Avatar>
            <div className={isRTL ? "text-right" : "text-left"}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span 
                  className="font-semibold cursor-pointer hover:underline hover:text-primary transition-colors"
                  onClick={() => navigate(`/profile/${post.author.user_id}`)}
                >
                  {post.author.full_name || post.author.username}
                </span>
                <span className="text-xs text-muted-foreground">@{post.author.username}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm text-muted-foreground mt-0.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
            </div>
          </div>
          {isOwnPost && onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer" 
              onClick={() => onDelete(post.post_id)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Post Content */}
        <div className={`mb-4 ${isRTL ? "text-right" : "text-left"}`}>
          <p className="whitespace-pre-wrap mb-3">{post.content}</p>

          {/* Stock Card if attached */}
          {(post.stock || post.stock_symbol) && (
            <div 
              className="bg-primary/5 hover:bg-primary/10 rounded-xl p-4 border border-primary/10 transition-all cursor-pointer group"
              onClick={() => navigate(`/stock/${post.stock?.symbol || post.stock_symbol}`)}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border font-bold text-primary">
                    {(post.stock?.symbol || post.stock_symbol)[0]}
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="font-bold group-hover:text-primary transition-colors">{post.stock?.symbol || post.stock_symbol}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {post.stock?.name || (language === "ar" ? "رؤية تفاصيل السهم" : "View stock details")}
                    </p>
                  </div>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  {post.stock?.price && (
                    <p className="text-lg font-bold">
                      ${post.stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  <p className={`text-xs text-primary flex items-center gap-1 ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
                    <TrendingUp className="w-3 h-3" />
                    {isRTL ? "عرض التحليلات" : "View Analytics"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className={`flex items-center justify-between pt-3 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.post_id)}
              className={`cursor-pointer ${post.is_liked ? "text-red-500" : ""} ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'} ${post.is_liked ? 'fill-red-500' : ''}`} />
              {post.likes_count}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`} 
              onClick={() => onComment(post.post_id)}
            >
              <MessageSquare className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {post.comments_count}
            </Button>
            {onShare && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`} 
                onClick={() => onShare(post.post_id)}
              >
                <Share2 className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {post.shares_count || 0}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(post.post_id)}
            className={`cursor-pointer ${post.is_bookmarked ? "text-primary" : ""}`}
          >
            <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-primary' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
