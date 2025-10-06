const API_BASE = '/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  token: string;
  salt: string;
}

export interface VaultItemResponse {
  _id: string;
  cipher: string;
  iv: string;
  titleHint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaultItemRequest {
  cipher: string;
  iv: string;
  titleHint?: string;
}

export interface UpdateVaultItemRequest {
  cipher: string;
  iv: string;
  titleHint?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  async signup(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getSalt(): Promise<ApiResponse<{ salt: string }>> {
    return this.request<{ salt: string }>('/crypto/salt');
  }

  async getVaultItems(): Promise<ApiResponse<VaultItemResponse[]>> {
    return this.request<VaultItemResponse[]>('/vault');
  }

  async createVaultItem(item: CreateVaultItemRequest): Promise<ApiResponse<VaultItemResponse>> {
    return this.request<VaultItemResponse>('/vault', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateVaultItem(id: string, item: UpdateVaultItemRequest): Promise<ApiResponse<VaultItemResponse>> {
    return this.request<VaultItemResponse>(`/vault/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteVaultItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/vault/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
