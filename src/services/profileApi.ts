import { API_BASE_URL, getHeaders } from './apiConfig';

export interface UserStats {
    followers_count: number;
    following_count: number;
    posts_count: number;
    total_trades: number;
    win_rate: number;
    avg_return: number;
    best_trade: number;
    portfolio_value: number;
    portfolio_change: number;
}

export interface Post {
    post_id: number;
    user_id: number;
    username: string;
    content: string;
    stock_symbol?: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    views_count: number;
    created_at: string;
    is_liked: boolean;
}

export interface Follower {
    user_id: number;
    username: string;
    email: string;
    profile_picture_url?: string;
    bio?: string;
    followers_count: number;
    is_verified: boolean;
}

class ProfileAPI {
    private getHeaders(includeAuth: boolean = true): HeadersInit {
        return getHeaders(includeAuth);
    }

    async getUserStats(userId: number): Promise<UserStats> {
        const response = await fetch(`${API_BASE_URL}/profile/stats/${userId}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user stats');
        }

        return response.json();
    }

    async getUserPosts(userId: number, limit: number = 20): Promise<Post[]> {
        const response = await fetch(
            `${API_BASE_URL}/profile/posts/${userId}?limit=${limit}`,
            {
                headers: this.getHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch user posts');
        }

        return response.json();
    }

    async getFollowers(userId: number, limit: number = 50): Promise<Follower[]> {
        const response = await fetch(
            `${API_BASE_URL}/profile/followers/${userId}?limit=${limit}`,
            {
                headers: this.getHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch followers');
        }

        return response.json();
    }

    async getFollowing(userId: number, limit: number = 50): Promise<Follower[]> {
        const response = await fetch(
            `${API_BASE_URL}/profile/following/${userId}?limit=${limit}`,
            {
                headers: this.getHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch following');
        }

        return response.json();
    }

    async followUser(userId: number, currentUserId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/profile/follow/${userId}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ current_user_id: currentUserId }),
        });

        if (!response.ok) {
            throw new Error('Failed to follow user');
        }
    }

    async unfollowUser(userId: number, currentUserId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/profile/unfollow/${userId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            body: JSON.stringify({ current_user_id: currentUserId }),
        });

        if (!response.ok) {
            throw new Error('Failed to unfollow user');
        }
    }

    async getUserById(userId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/profile/user/${userId}`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('User not found');
        return response.json();
    }
}

export const profileAPI = new ProfileAPI();
