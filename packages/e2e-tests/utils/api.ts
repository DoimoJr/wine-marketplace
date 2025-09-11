import { APIRequestContext } from '@playwright/test';

export class ApiHelper {
  private request: APIRequestContext;
  private baseURL: string;
  private authToken?: string;

  constructor(request: APIRequestContext, baseURL = 'http://localhost:3002') {
    this.request = request;
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    return await this.request.post(`${this.baseURL}/api/auth/register`, {
      headers: this.getHeaders(),
      data: userData,
    });
  }

  async login(credentials: { email: string; password: string }) {
    return await this.request.post(`${this.baseURL}/api/auth/login`, {
      headers: this.getHeaders(),
      data: credentials,
    });
  }

  // User endpoints
  async getProfile() {
    return await this.request.get(`${this.baseURL}/api/auth/profile`, {
      headers: this.getHeaders(),
    });
  }

  async updateProfile(data: any) {
    return await this.request.patch(`${this.baseURL}/api/users/me`, {
      headers: this.getHeaders(),
      data,
    });
  }

  // Wine endpoints
  async getWines(params: any = {}) {
    const searchParams = new URLSearchParams();
    
    // Handle arrays and regular params properly for NestJS DTO parsing
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        // For arrays, append each item with the same key - this is what NestJS expects
        value.forEach((item) => {
          searchParams.append(key, item.toString());
        });
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    }
    
    return await this.request.get(`${this.baseURL}/api/wines?${searchParams}`, {
      headers: this.getHeaders(),
    });
  }

  async getWine(id: string) {
    return await this.request.get(`${this.baseURL}/api/wines/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async createWine(wineData: any) {
    return await this.request.post(`${this.baseURL}/api/wines`, {
      headers: this.getHeaders(),
      data: wineData,
    });
  }

  async updateWine(id: string, wineData: any) {
    return await this.request.patch(`${this.baseURL}/api/wines/${id}`, {
      headers: this.getHeaders(),
      data: wineData,
    });
  }

  async deleteWine(id: string) {
    return await this.request.delete(`${this.baseURL}/api/wines/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Order endpoints
  async getOrders(params: any = {}) {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `${this.baseURL}/api/orders?${queryString}` : `${this.baseURL}/api/orders`;
    
    return await this.request.get(url, {
      headers: this.getHeaders(),
    });
  }

  async getOrder(id: string) {
    return await this.request.get(`${this.baseURL}/api/orders/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async createOrder(orderData: any) {
    return await this.request.post(`${this.baseURL}/api/orders`, {
      headers: this.getHeaders(),
      data: orderData,
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return await this.request.patch(`${this.baseURL}/api/orders/${id}/status`, {
      headers: this.getHeaders(),
      data: { status },
    });
  }

  // Review endpoints
  async getReviews(params: any = {}) {
    const searchParams = new URLSearchParams(params);
    return await this.request.get(`${this.baseURL}/api/reviews?${searchParams}`, {
      headers: this.getHeaders(),
    });
  }

  async createReview(reviewData: any) {
    return await this.request.post(`${this.baseURL}/api/reviews`, {
      headers: this.getHeaders(),
      data: reviewData,
    });
  }

  // Admin endpoints
  async getAdminStats() {
    return await this.request.get(`${this.baseURL}/api/admin/stats`, {
      headers: this.getHeaders(),
    });
  }

  async banUser(userId: string, reason?: string) {
    return await this.request.post(`${this.baseURL}/api/admin/users/${userId}/ban`, {
      headers: this.getHeaders(),
      data: { reason },
    });
  }

  async approveWine(wineId: string) {
    return await this.request.post(`${this.baseURL}/api/admin/wines/${wineId}/approve`, {
      headers: this.getHeaders(),
    });
  }

  async rejectWine(wineId: string, reason?: string) {
    return await this.request.post(`${this.baseURL}/api/admin/wines/${wineId}/reject`, {
      headers: this.getHeaders(),
      data: { reason },
    });
  }

  // Refund endpoints
  async createRefundRequest(refundData: any) {
    return await this.request.post(`${this.baseURL}/api/refunds`, {
      headers: this.getHeaders(),
      data: refundData,
    });
  }

  async getRefundRequests() {
    return await this.request.get(`${this.baseURL}/api/refunds`, {
      headers: this.getHeaders(),
    });
  }

  // Helper methods
  async expectSuccess(response: any, expectedStatus = 200) {
    if (response.status() !== expectedStatus) {
      const body = await response.text();
      throw new Error(`Expected status ${expectedStatus}, got ${response.status()}: ${body}`);
    }
    return await response.json();
  }

  async expectError(response: any, expectedStatus = 400) {
    if (response.status() !== expectedStatus) {
      const body = await response.text();
      throw new Error(`Expected status ${expectedStatus}, got ${response.status()}: ${body}`);
    }
    return await response.json();
  }
}