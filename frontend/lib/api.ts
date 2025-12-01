export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';


class ApiClient {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage only on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    console.log("Setting token in ApiClient:", token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Check localStorage first
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      this.token = storedToken;
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private async request(method: string, endpoint: string, body?: any) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // Handle 401 Unauthorized
      const public_api=['/api/auth/login','/api/auth/register'];
      if (public_api.includes(endpoint)) {
        return response.json();
      }
      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized - Please login again');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || 'Request failed');
      }

      return response.json();
    } catch (error: any) {
      console.error(`API Error [${method} ${endpoint}]:`, error.message);
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request('GET', endpoint);
  }

  async post(endpoint: string, body: any) {
    return this.request('POST', endpoint, body);
  }

  async put(endpoint: string, body: any) {
    return this.request('PUT', endpoint, body);
  }

  async delete(endpoint: string) {
    return this.request('DELETE', endpoint);
  }

async login(email: string, password: string) {
  const response = await this.post('/api/auth/login', { email, password });
  
  // Only set token if response has it
  if (response && response.token) {
    this.setToken(response.token);
  }
  
  return response;
}


async register(data: any) {
  const response = await this.post('/api/auth/register', data);
  if (response.token) this.setToken(response.token);
  return response;
}


  async checkAuth() {
    try {
      const token = this.getToken();
      console.log('Checking auth with token:', token);
      if (!token) {
        return null;
      }
      const response = await this.get('/api/auth/me');
      return response;
    } catch (error) {
      this.clearToken();
      return null;
    }
  }

  async searchGuides(filters: any) {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.pinCode) params.append('pinCode', filters.pinCode);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    return this.get(`/api/guides/search${queryString ? '?' + queryString : ''}`);
  }

  async searchHotels(filters: any) {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.pinCode) params.append('pinCode', filters.pinCode);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    return this.get(`/api/hotels/search${queryString ? '?' + queryString : ''}`);
  }
}

export const api = new ApiClient();
