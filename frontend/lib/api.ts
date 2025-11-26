const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers as HeadersInit);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Guides
  async searchGuides(params: any) {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return this.request(`/api/guides/search?${query}`);
  }

  async getGuide(id: string) {
    return this.request(`/api/guides/${id}`);
  }

  async createGuideProfile(data: any) {
    return this.request('/api/guides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Hotels
  async searchHotels(params: any) {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    return this.request(`/api/hotels/search?${query}`);
  }

  async getHotel(id: string, params?: any) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/api/hotels/${id}${query}`);
  }

  async createHotel(data: any) {
    return this.request('/api/hotels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bookings
  async createBooking(data: any) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings() {
    return this.request('/api/bookings');
  }

  async updateBookingStatus(id: string, status: string) {
    return this.request(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Payments
  async createPaymentIntent(bookingId: string, bookingType: string) {
    return this.request('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId, bookingType }),
    });
  }

  // Reviews
  async getGuideReviews(guideId: string) {
    return this.request(`/api/reviews/guide/${guideId}`);
  }

  async createReview(data: any) {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Messages
  async getMessages() {
    return this.request('/api/messages');
  }

  async getBookingMessages(bookingId: string) {
    return this.request(`/api/messages/booking/${bookingId}`);
  }

  // File upload
  async uploadFile(file: File, type: string) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/upload/${type}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

export const api = new ApiClient(API_URL);
