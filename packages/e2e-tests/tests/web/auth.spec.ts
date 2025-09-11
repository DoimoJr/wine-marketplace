import { test, expect } from '@playwright/test';
import { TestDatabase, AuthHelper } from '../../utils';

let db: TestDatabase;
let auth: AuthHelper;

test.beforeAll(async () => {
  db = new TestDatabase();
  await db.connect();
});

test.afterAll(async () => {
  await db.disconnect();
});

test.beforeEach(async ({ page }) => {
  auth = new AuthHelper(page, db);
  await db.cleanup();
});

test.describe('Authentication', () => {
  test('should register a new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const userData = {
      email: `newuser${timestamp}@example.com`,
      username: `newuser${timestamp}`,
      password: 'Password123',
      firstName: 'New',
      lastName: 'User',
    };

    const result = await auth.register(userData);
    expect(result.success).toBe(true);

    // Verify user was created in database
    const dbUser = await db.getUserByEmail(userData.email);
    expect(dbUser).toBeTruthy();
    expect(dbUser?.username).toBe(userData.username);
  });

  test('should not register user with existing email', async ({ page }) => {
    // Create a user first
    const existingUser = await db.createTestUser();

    const userData = {
      email: existingUser.email,
      username: 'differentusername',
      password: 'Password123',
    };

    const result = await auth.register(userData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('email');
  });

  test('should login with valid credentials', async ({ page }) => {
    const testUser = await db.createTestUser({
      hashedPassword: '$2b$10$test.hash.for.Password123',
    });

    await auth.loginAsUser(testUser.email, 'Password123');
    
    // Verify we're logged in
    expect(await auth.isLoggedIn()).toBe(true);
    await expect(page).toHaveURL(/\/(dashboard|home|wines)/);
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await auth.loginAsUser();
    expect(await auth.isLoggedIn()).toBe(true);

    await auth.logout();
    expect(await auth.isLoggedIn()).toBe(false);
    await expect(page).toHaveURL('/');
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.goto('/wines/new');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should remember login state after page refresh', async ({ page }) => {
    await auth.loginAsUser();
    expect(await auth.isLoggedIn()).toBe(true);

    await page.reload();
    expect(await auth.isLoggedIn()).toBe(true);
  });
});