// API Configuration for CentsWise Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request<{ access_token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );

    if (response.data?.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async logout() {
    this.clearToken();
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request<{
      financial: {
        total_collected: number;
        total_spent: number;
        available_balance: number;
      };
      inventory: {
        total_items: number;
        available_items: number;
        distributed_items: number;
        active_distributions: number;
      };
      recent_transactions: any[];
    }>('/dashboard/metrics');
  }

  async getFinancialSummary() {
    return this.request('/dashboard/financial-summary');
  }

  async getStats() {
    return this.request('/dashboard/stats');
  }

  // Money management endpoints
  async addCredit(creditData: {
    donor_name: string;
    amount: number;
    date: string;
    purpose: string;
    payment_method?: string;
    contact_info?: string;
  }) {
    return this.request('/money/credits', {
      method: 'POST',
      body: JSON.stringify(creditData),
    });
  }

  async getCredits(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request(`/money/credits${queryString ? `?${queryString}` : ''}`);
  }

  async addExpense(expenseData: {
    amount: number;
    date: string;
    purpose: string;
    category?: string;
    beneficiary_name?: string;
  }) {
    return this.request('/money/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async getExpenses(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request(`/money/expenses${queryString ? `?${queryString}` : ''}`);
  }

  async getBalance() {
    return this.request<{
      total_collected: number;
      total_spent: number;
      available_balance: number;
    }>('/money/balance');
  }

  // Property management endpoints
  async addItem(itemData: {
    name: string;
    category?: string;
    total_quantity: number;
    condition?: string;
    location?: string;
    description?: string;
  }) {
    return this.request('/property/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async getItems(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    status?: string;
  }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request(`/property/items${queryString ? `?${queryString}` : ''}`);
  }

  async distributeItem(distributionData: {
    item_id: number;
    recipient_name: string;
    distribution_date: string;
    quantity?: number;
    expected_return_date?: string;
    recipient_contact?: string;
    notes?: string;
  }) {
    return this.request('/property/distributions', {
      method: 'POST',
      body: JSON.stringify(distributionData),
    });
  }

  async returnItem(distributionId: number, returnData?: {
    return_date?: string;
    return_condition?: string;
    notes?: string;
  }) {
    return this.request(`/property/distributions/${distributionId}/return`, {
      method: 'POST',
      body: JSON.stringify(returnData || {}),
    });
  }

  // Receipts endpoints
  async generateReceipt(creditId: number) {
    return this.request(`/receipts/generate/${creditId}`, {
      method: 'POST',
    });
  }

  async getReceipts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request(`/receipts${queryString ? `?${queryString}` : ''}`);
  }

  async downloadReceipt(receiptId: number) {
    try {
      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(
        `${this.baseUrl}/receipts/download/${receiptId}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      return { error: error instanceof Error ? error.message : 'Download failed' };
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
