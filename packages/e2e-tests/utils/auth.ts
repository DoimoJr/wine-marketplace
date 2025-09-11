import { Page } from '@playwright/test';
import { TestDatabase } from './database';

export class AuthHelper {
  private page: Page;
  private db: TestDatabase;

  constructor(page: Page, db: TestDatabase) {
    this.page = page;
    this.db = db;
  }

  async loginAsUser(email?: string, password?: string) {
    // If no credentials provided, create a test user
    let testUser;
    if (!email) {
      testUser = await this.db.createTestUser({
        hashedPassword: '$2b$10$test.hash.for.Password123', // Mock hash for 'Password123'
      });
      email = testUser.email;
      password = 'Password123';
    }

    await this.page.goto('/auth/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password || 'Password123');
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for navigation to dashboard or home
    await this.page.waitForURL(/\/(dashboard|home|wines)/);
    
    return testUser;
  }

  async loginAsAdmin(email?: string, password?: string) {
    // If no credentials provided, create a test admin
    let testAdmin;
    if (!email) {
      testAdmin = await this.db.createTestAdmin({
        hashedPassword: '$2b$10$test.hash.for.Password123', // Mock hash for 'Password123'
      });
      email = testAdmin.email;
      password = 'Password123';
    }

    await this.page.goto('/auth/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password || 'Password123');
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for navigation to admin dashboard
    await this.page.waitForURL('/admin');
    
    return testAdmin;
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/');
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    await this.page.goto('/auth/register');
    
    await this.page.fill('[data-testid="email-input"]', userData.email);
    await this.page.fill('[data-testid="username-input"]', userData.username);
    await this.page.fill('[data-testid="password-input"]', userData.password);
    
    if (userData.firstName) {
      await this.page.fill('[data-testid="firstName-input"]', userData.firstName);
    }
    
    if (userData.lastName) {
      await this.page.fill('[data-testid="lastName-input"]', userData.lastName);
    }
    
    await this.page.click('[data-testid="register-button"]');
    
    // Wait for registration success or error
    try {
      await this.page.waitForURL('/dashboard', { timeout: 5000 });
      return { success: true };
    } catch {
      const errorMessage = await this.page.textContent('[data-testid="error-message"]');
      return { success: false, error: errorMessage };
    }
  }

  // Helper method to get JWT token from local storage (for API tests)
  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    });
  }

  // Helper method to set JWT token in local storage (for API tests)
  async setAuthToken(token: string) {
    await this.page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, token);
  }
}