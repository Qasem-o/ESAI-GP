import { API_BASE_URL, getHeaders } from './apiConfig';

export interface PostAuthor {
    user_id: number;
    username: string;
    full_name: string | null;
    profile_picture_url: string | null;
}

export interface PostStock {
    symbol: string;
    name: string;
    price: number;
}

export interface FeedPost {
    post_id: number;
    content: string;
    stock: PostStock | null;
    created_at: string;
    author: PostAuthor;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    is_bookmarked: boolean;
}

export interface PostComment {
    comment_id: number;
    content: string;
    created_at: string;
    author: PostAuthor;
}

export interface TopTrader {
    user_id: number;
    username: string;
    full_name: string | null;
    profile_picture_url: string | null;
    followers_count: number;
    posts_count: number;
    is_following: boolean;
    portfolio_value?: number;
}
// ====== API Class ======

class CommunityAPI {
    private getHeaders(requireAuth = true) {
        return getHeaders(requireAuth);
    }

    // --- Feed ---
    async getFeed(page = 1, limit = 20, filter: 'all' | 'trending' | 'following' = 'all'): Promise<FeedPost[]> {
        const response = await fetch(
            `${API_BASE_URL}/community/feed?page=${page}&limit=${limit}&filter=${filter}`,
            { headers: this.getHeaders(false) }
        );
        if (!response.ok) throw new Error('Failed to fetch feed');
        return response.json();
    }

    async getStockPosts(symbol: string, page = 1, limit = 20): Promise<FeedPost[]> {
        const response = await fetch(
            `${API_BASE_URL}/community/stocks/${symbol}/posts?page=${page}&limit=${limit}`,
            { headers: this.getHeaders(false) }
        );
        if (!response.ok) throw new Error('Failed to fetch stock posts');
        return response.json();
    }

    // --- Posts ---
    async createPost(content: string, stock_symbol?: string): Promise<{ message: string; post_id: number }> {
        const response = await fetch(`${API_BASE_URL}/community/posts`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ content, stock_symbol }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create post');
        }
        return response.json();
    }

    async deletePost(postId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete post');
        return response.json();
    }

    // --- Likes ---
    async toggleLike(postId: number): Promise<{ liked: boolean; likes_count: number }> {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/like`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to toggle like');
        return response.json();
    }

    // --- Bookmarks ---
    async toggleBookmark(postId: number): Promise<{ bookmarked: boolean }> {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/bookmark`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to toggle bookmark');
        return response.json();
    }

    // --- Comments ---
    async getComments(postId: number): Promise<PostComment[]> {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
            headers: this.getHeaders(false),
        });
        if (!response.ok) throw new Error('Failed to fetch comments');
        return response.json();
    }

    async createComment(postId: number, content: string): Promise<PostComment> {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create comment');
        }
        return response.json();
    }

    async deleteComment(commentId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/community/comments/${commentId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete comment');
        return response.json();
    }

    // --- Follow ---
    async toggleFollow(targetUserId: number): Promise<{ following: boolean }> {
        const response = await fetch(`${API_BASE_URL}/community/follow/${targetUserId}`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to toggle follow');
        return response.json();
    }

    // --- Top Traders ---
    async getTopTraders(): Promise<TopTrader[]> {
        const response = await fetch(`${API_BASE_URL}/community/top-traders`, {
            headers: this.getHeaders(false),
        });
        if (!response.ok) throw new Error('Failed to fetch top traders');
        return response.json();
    }
}

export const communityAPI = new CommunityAPI();
