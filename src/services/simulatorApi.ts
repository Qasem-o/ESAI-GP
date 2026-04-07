const API_BASE_URL = 'http://localhost:8000';

class SimulatorAPI {
    private getHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async getSummary(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/simulator/summary`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch summary');
        return response.json();
    }

    async getHoldings(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/simulator/holdings`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch holdings');
        return response.json();
    }

    async getTransactions(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/simulator/transactions`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return response.json();
    }

    async buyStock(symbol: string, shares: number, price: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/simulator/buy`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ symbol, shares, price }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to buy stock');
        }
        return response.json();
    }

    async sellStock(symbol: string, shares: number, price: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/simulator/sell`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ symbol, shares, price }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to sell stock');
        }
        return response.json();
    }

    async resetSimulator(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/simulator/reset`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to reset simulator');
        }
        return response.json();
    }
}

export const simulatorAPI = new SimulatorAPI();
