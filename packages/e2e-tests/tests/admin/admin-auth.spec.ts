import { test, expect } from '@playwright/test';
import { TestDatabase, AuthHelper } from '../../utils';
import { UserRole } from '@wine-marketplace/shared';

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

test.describe('Admin Authentication', () => {
  test('should allow admin to access admin dashboard', async ({ page }) => {
    await auth.loginAsAdmin();
    
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('should redirect regular user from admin dashboard', async ({ page }) => {
    await auth.loginAsUser();
    
    await page.goto('/admin');
    
    // Should be redirected or show access denied
    await expect(page).not.toHaveURL('/admin');
    // Could be redirected to home or show error message
    const currentUrl = page.url();
    expect(currentUrl === '/' || currentUrl.includes('unauthorized')).toBe(true);
  });

  test('should redirect unauthenticated user from admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show admin navigation menu for admin users', async ({ page }) => {
    await auth.loginAsAdmin();
    
    // Should see admin-specific navigation
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Wines')).toBeVisible();
    await expect(page.locator('text=Orders')).toBeVisible();
    await expect(page.locator('text=Refunds')).toBeVisible();
  });

  test('should not show admin navigation for regular users', async ({ page }) => {
    await auth.loginAsUser();
    
    await expect(page.locator('[data-testid="admin-nav"]')).not.toBeVisible();
  });

  test('should maintain admin session after page refresh', async ({ page }) => {
    await auth.loginAsAdmin();
    await expect(page).toHaveURL('/admin');
    
    await page.reload();
    
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });
});