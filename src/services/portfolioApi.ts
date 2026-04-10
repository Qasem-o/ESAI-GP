/**
 * Portfolio API service
 * Handles all portfolio-related API calls (holdings, transactions, buy/sell)
 */

const API_BASE_URL = 'https://esai-backend.onrender.com';

export interface PortfolioSummary {
    total_value: number;
    total_cost: number;
    total_gain: number;
    gain_percentage: number;
    day_change: number;
    day_change_percentage: number;
    cash: number;
    holdings_count: number;
}

export interface Holding {
    holding_id: number;
    stock_symbol: string;
    stock_name: string | null;
    shares: number;
    avg_price: number;
    current_price: number;
    total_value: number;
    gain: number;
    gain_percentage: number;
    allocation: number;
    day_change: number;
    currency?: string;
    currency_symbol?: string;
    usd_price?: number;
}

export interface Transaction {
    transaction_id: number;
    stock_symbol: string;
    stock_name: string | null;
    transaction_type: 'buy' | 'sell';
    shares: number;
    price: number;
    total: number;
    created_at: string;
}

export interface AvailableStock {
    symbol: string;
    name: string;
    current_price: number;
    sector: string | null;
    currency?: string;
    currency_symbol?: string;
    usd_price?: number;
}

export interface PerformancePoint {
    day: string;
    value: number;
}

class PortfolioAPI {
    private getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async getSummary(): Promise<PortfolioSummary> {
        const response = await fetch(`${API_BASE_URL}/portfolio/summary`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Session expired');
            throw new Error('Failed to fetch portfolio summary');
        }

        return response.json();
    }

    async getHoldings(): Promise<Holding[]> {
        const response = await fetch(`${API_BASE_URL}/portfolio/holdings`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Session expired');
            throw new Error('Failed to fetch holdings');
        }

        return response.json();
    }

    async getTransactions(limit: number = 50): Promise<Transaction[]> {
        const response = await fetch(`${API_BASE_URL}/portfolio/transactions?limit=${limit}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Session expired');
            throw new Error('Failed to fetch transactions');
        }

        return response.json();
    }

    async buyStock(symbol: string, shares: number, price: number, transaction_date?: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/portfolio/buy`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ symbol, shares, price, transaction_date }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to buy stock');
        }

        return response.json();
    }

    async sellStock(symbol: string, shares: number, price: number, transaction_date?: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/portfolio/sell`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ symbol, shares, price, transaction_date }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to sell stock');
        }

        return response.json();
    }

    async getCash(): Promise<{ balance: number }> {
        const response = await fetch(`${API_BASE_URL}/portfolio/cash`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cash balance');
        }

        return response.json();
    }

    async deposit(amount: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/portfolio/deposit`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to deposit');
        }

        return response.json();
    }

    async withdraw(amount: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/portfolio/withdraw`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to withdraw');
        }

        return response.json();
    }

    async getPerformance(): Promise<PerformancePoint[]> {
        const response = await fetch(`${API_BASE_URL}/portfolio/performance`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch performance');
        }

        return response.json();
    }

    async getAvailableStocks(): Promise<AvailableStock[]> {
        const response = await fetch(`${API_BASE_URL}/stocks`, {
            headers: this.getHeaders(false),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch available stocks');
        }

        return response.json();
    }

    async resetPortfolio(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/portfolio/reset`, {
            method: 'POST',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to reset portfolio');
        }

        return response.json();
    }

    // ====== Watchlist ======

    async getWatchlist(): Promise<WatchlistItem[]> {
        const response = await fetch(`${API_BASE_URL}/portfolio/watchlist`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            if (response.status === 401) throw new Error('Session expired');
            throw new Error('Failed to fetch watchlist');
        }
        return response.json();
    }

    async addToWatchlist(symbol: string, name?: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/portfolio/watchlist/add`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ symbol, name }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add to watchlist');
        }
        return response.json();
    }

    async removeFromWatchlist(symbol: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/portfolio/watchlist/${symbol}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to remove from watchlist');
        }
        return response.json();
    }

    async checkWatchlist(symbol: string): Promise<{ is_watchlisted: boolean }> {
        const response = await fetch(`${API_BASE_URL}/portfolio/watchlist/check/${symbol}`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            return { is_watchlisted: false };
        }
        return response.json();
    }
}

export interface WatchlistItem {
    watchlist_id: number;
    stock_symbol: string;
    stock_name: string;
    current_price: number;
    currency: string;
    currency_symbol: string;
    sector: string | null;
    added_at: string | null;
}

export const portfolioAPI = new PortfolioAPI();
