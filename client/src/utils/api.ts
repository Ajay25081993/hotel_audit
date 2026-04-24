const API_BASE_URL = '/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Property {
  id: number;
  name: string;
  location: string;
  property_type: string;
  contact_info?: any;
  created_at: string;
}

export interface Audit {
  id: number;
  property_id: number;
  auditor_id: number;
  reviewer_id?: number;
  scheduled_date: string;
  audit_type: string;
  status: string;
  completed_date?: string;
  overall_score?: number;
  compliance_zone?: string;
  notes?: string;
  property?: Property;
  auditor?: User;
  reviewer?: User;
  created_at: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    // Store user info directly since we're not using JWT tokens
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('No user logged in');
    }
    return JSON.parse(userStr);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Properties
  async getProperties(): Promise<Property[]> {
    return this.request<Property[]>('/properties');
  }

  async getProperty(id: number): Promise<Property> {
    return this.request<Property>(`/properties/${id}`);
  }

  // Audits
  async getAudits(params?: {
    auditor_id?: number;
    reviewer_id?: number;
    property_id?: number;
    status?: string;
  }): Promise<Audit[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/audits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Audit[]>(endpoint);
  }

  async getAudit(id: number): Promise<Audit> {
    return this.request<Audit>(`/audits/${id}`);
  }

  // AI Features
  async analyzePhoto(imageBase64: string, context: string, auditItemId?: number) {
    return this.request('/ai/analyze-photo', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
        context,
        audit_item_id: auditItemId,
      }),
    });
  }

  async generateReport(auditId: number) {
    return this.request(`/ai/generate-report`, {
      method: 'POST',
      body: JSON.stringify({
        audit_id: auditId,
      }),
    });
  }

  async suggestScore(auditItemId: number, observations: string) {
    return this.request('/ai/suggest-score', {
      method: 'POST',
      body: JSON.stringify({
        audit_item_id: auditItemId,
        observations,
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL.replace('/api', '')}/`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
