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

test.describe('Admin User Management', () => {
  test('should display users list', async ({ page }) => {
    await auth.loginAsAdmin();
    
    // Create some test users
    await db.createTestUser({
      username: 'testuser1',
      email: 'test1@example.com',
    });
    await db.createTestUser({
      username: 'testuser2',
      email: 'test2@example.com',
    });
    
    await page.goto('/admin/users');
    
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('text=testuser1')).toBeVisible();
    await expect(page.locator('text=testuser2')).toBeVisible();
  });

  test('should search users by username or email', async ({ page }) => {
    await auth.loginAsAdmin();
    
    await db.createTestUser({
      username: 'johndoe',
      email: 'john@example.com',
    });
    await db.createTestUser({
      username: 'janedoe',
      email: 'jane@example.com',
    });
    
    await page.goto('/admin/users');
    
    // Search by username
    await page.fill('[data-testid="search-input"]', 'johndoe');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('text=johndoe')).toBeVisible();
    await expect(page.locator('text=janedoe')).not.toBeVisible();
  });

  test('should ban a user', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const testUser = await db.createTestUser();
    
    await page.goto('/admin/users');
    
    // Find user row and click ban button
    const userRow = page.locator(`[data-testid="user-row-${testUser.id}"]`);
    await userRow.locator('[data-testid="ban-user-button"]').click();
    
    // Fill ban reason modal
    await page.fill('[data-testid="ban-reason-input"]', 'Violation of terms');
    await page.click('[data-testid="confirm-ban-button"]');
    
    // Should see success message
    await expect(page.locator('text=User banned successfully')).toBeVisible();
    
    // User should show as banned
    await expect(userRow.locator('[data-testid="user-status"]')).toContainText('Banned');
  });

  test('should unban a user', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const testUser = await db.createTestUser({ banned: true });
    
    await page.goto('/admin/users');
    
    const userRow = page.locator(`[data-testid="user-row-${testUser.id}"]`);
    await userRow.locator('[data-testid="unban-user-button"]').click();
    
    await expect(page.locator('text=User unbanned successfully')).toBeVisible();
    await expect(userRow.locator('[data-testid="user-status"]')).toContainText('Active');
  });

  test('should verify a user', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const testUser = await db.createTestUser({ verified: false });
    
    await page.goto('/admin/users');
    
    const userRow = page.locator(`[data-testid="user-row-${testUser.id}"]`);
    await userRow.locator('[data-testid="verify-user-button"]').click();
    
    await expect(page.locator('text=User verified successfully')).toBeVisible();
    await expect(userRow.locator('[data-testid="verification-status"]')).toContainText('Verified');
  });

  test('should view user details', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const testUser = await db.createTestUser({
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Test user bio',
      location: 'New York',
    });
    
    await page.goto('/admin/users');
    
    const userRow = page.locator(`[data-testid="user-row-${testUser.id}"]`);
    await userRow.locator('[data-testid="view-user-button"]').click();
    
    await expect(page).toHaveURL(`/admin/users/${testUser.id}`);
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Test user bio')).toBeVisible();
    await expect(page.locator('text=New York')).toBeVisible();
  });

  test('should display user statistics', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    const buyer = await db.createTestUser();
    
    // Create some wines and orders for statistics
    const wine = await db.createTestWine(seller.id);
    await db.createTestOrder(seller.id, buyer.id, wine.id);
    
    await page.goto(`/admin/users/${seller.id}`);
    
    // Should show user statistics
    await expect(page.locator('[data-testid="user-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="wines-count"]')).toContainText('1');
    await expect(page.locator('[data-testid="orders-sold"]')).toContainText('1');
  });

  test('should filter users by status', async ({ page }) => {
    await auth.loginAsAdmin();
    
    await db.createTestUser({ banned: true });
    await db.createTestUser({ banned: false });
    await db.createTestUser({ verified: false });
    
    await page.goto('/admin/users');
    
    // Filter by banned users
    await page.selectOption('[data-testid="status-filter"]', 'banned');
    await page.click('[data-testid="apply-filter"]');
    
    const userRows = page.locator('[data-testid^="user-row-"]');
    await expect(userRows).toHaveCount(1);
    await expect(userRows.first().locator('[data-testid="user-status"]')).toContainText('Banned');
  });

  test('should export users data', async ({ page }) => {
    await auth.loginAsAdmin();
    
    await db.createTestUser();
    await db.createTestUser();
    
    await page.goto('/admin/users');
    
    // Start download and wait for it
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-users-button"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('users');
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/);
  });

  test('should paginate users list', async ({ page }) => {
    await auth.loginAsAdmin();
    
    // Create many users to test pagination
    for (let i = 0; i < 25; i++) {
      await db.createTestUser({
        username: `testuser${i}`,
        email: `test${i}@example.com`,
      });
    }
    
    await page.goto('/admin/users');
    
    // Should show pagination controls
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-page"]')).toBeVisible();
    
    // Click next page
    await page.click('[data-testid="next-page"]');
    
    // Should see different users
    const currentPageUsers = await page.locator('[data-testid^="user-row-"]').count();
    expect(currentPageUsers).toBeGreaterThan(0);
  });
});