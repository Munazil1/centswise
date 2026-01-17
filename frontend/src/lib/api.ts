// API Configuration for CentsWise Backend

const RAW_API_URL = import.meta.env.VITE_API_URL;

if (!RAW_API_URL) {
  throw new Error(
    'VITE_API_URL is not defined. Please set it in Vercel environment variables.'
  );
}

// Remove trailing slash if present
const API_BASE_URL = RAW_API_URL.replace(/\/$/, '');

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

      const contentType = response.headers.get('content-type');
      const data =
        contentType && contentType.includes('application/json')
          ? await response.json()
          : null;

      if (!response.ok) {
        return {
          error: data?.error || data?.message || 'Request failed',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth
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

  // Dashboard
  async getDashboardMetrics() {
    return this.request('/dashboard/metrics');
  }

  async getFinancialSummary() {
    return this.request('/dashboard/financial-summary');
  }

  async getStats() {
    return this.request('/dashboard/stats');
  }

  // Money
  async addCredit(creditData: any) {
    return this.request('/money/credits', {
      method: 'POST',
      body: JSON.stringify(creditData),
    });
  }

  async getCredits(params?: Record<string, string>) {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/money/credits${qs}`);
  }

  async addExpense(expenseData: any) {
    return this.request('/money/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async getExpenses(params?: Record<string, string>) {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/money/expenses${qs}`);
  }

  async getBalance() {
    return this.request('/money/balance');
  }

  // Property
  async addItem(itemData: any) {
    return this.request('/property/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async getItems(params?: Record<string, string>) {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/property/items${qs}`);
  }

  async distributeItem(data: any) {
    return this.request('/property/distributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async returnItem(id: number, data?: any) {
    return this.request(`/property/distributions/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // Receipts
  async generateReceipt(creditId: number) {
    return this.request(`/receipts/generate/${creditId}`, {
      method: 'POST',
    });
  }

  async getReceipts(params?: Record<string, string>) {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/receipts${qs}`);
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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
