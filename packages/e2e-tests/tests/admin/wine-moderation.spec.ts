import { test, expect } from '@playwright/test';
import { TestDatabase, AuthHelper } from '../../utils';
import { WineStatus } from '@wine-marketplace/shared';

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

test.describe('Admin Wine Moderation', () => {
  test('should display pending wine listings', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, {
      title: 'Pending Wine 1',
      status: WineStatus.ACTIVE, // In real app, there might be a PENDING status
    });
    await db.createTestWine(seller.id, {
      title: 'Pending Wine 2',
      status: WineStatus.ACTIVE,
    });
    
    await page.goto('/admin/wines');
    
    await expect(page.locator('[data-testid="wines-table"]')).toBeVisible();
    await expect(page.locator('text=Pending Wine 1')).toBeVisible();
    await expect(page.locator('text=Pending Wine 2')).toBeVisible();
  });

  test('should approve a wine listing', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      title: 'Wine to Approve',
    });
    
    await page.goto('/admin/wines');
    
    const wineRow = page.locator(`[data-testid="wine-row-${wine.id}"]`);
    await wineRow.locator('[data-testid="approve-wine-button"]').click();
    
    await expect(page.locator('text=Wine approved successfully')).toBeVisible();
    await expect(wineRow.locator('[data-testid="wine-status"]')).toContainText('Approved');
  });

  test('should reject a wine listing with reason', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      title: 'Wine to Reject',
    });
    
    await page.goto('/admin/wines');
    
    const wineRow = page.locator(`[data-testid="wine-row-${wine.id}"]`);
    await wineRow.locator('[data-testid="reject-wine-button"]').click();
    
    // Fill rejection reason
    await page.fill('[data-testid="rejection-reason-input"]', 'Poor quality images');
    await page.click('[data-testid="confirm-reject-button"]');
    
    await expect(page.locator('text=Wine rejected successfully')).toBeVisible();
    await expect(wineRow.locator('[data-testid="wine-status"]')).toContainText('Rejected');
  });

  test('should view wine details for moderation', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      title: 'Detailed Wine',
      description: 'Detailed wine description',
      vintage: 2018,
      producer: 'Test Producer',
      images: ['image1.jpg', 'image2.jpg'],
    });
    
    await page.goto('/admin/wines');
    
    const wineRow = page.locator(`[data-testid="wine-row-${wine.id}"]`);
    await wineRow.locator('[data-testid="view-wine-button"]').click();
    
    await expect(page).toHaveURL(`/admin/wines/${wine.id}`);
    await expect(page.locator('text=Detailed Wine')).toBeVisible();
    await expect(page.locator('text=Detailed wine description')).toBeVisible();
    await expect(page.locator('text=2018')).toBeVisible();
    await expect(page.locator('text=Test Producer')).toBeVisible();
    
    // Should show images
    await expect(page.locator('[data-testid="wine-images"]')).toBeVisible();
  });

  test('should filter wines by status', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, {
      title: 'Active Wine',
      status: WineStatus.ACTIVE,
    });
    await db.createTestWine(seller.id, {
      title: 'Inactive Wine',
      status: WineStatus.INACTIVE,
    });
    
    await page.goto('/admin/wines');
    
    // Filter by inactive wines
    await page.selectOption('[data-testid="status-filter"]', WineStatus.INACTIVE);
    await page.click('[data-testid="apply-filter"]');
    
    const wineRows = page.locator('[data-testid^="wine-row-"]');
    await expect(wineRows).toHaveCount(1);
    await expect(page.locator('text=Inactive Wine')).toBeVisible();
    await expect(page.locator('text=Active Wine')).not.toBeVisible();
  });

  test('should search wines by title or seller', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller1 = await db.createTestUser({ username: 'seller1' });
    const seller2 = await db.createTestUser({ username: 'seller2' });
    
    await db.createTestWine(seller1.id, { title: 'Chianti Wine' });
    await db.createTestWine(seller2.id, { title: 'Bordeaux Wine' });
    
    await page.goto('/admin/wines');
    
    // Search by wine title
    await page.fill('[data-testid="search-input"]', 'Chianti');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('text=Chianti Wine')).toBeVisible();
    await expect(page.locator('text=Bordeaux Wine')).not.toBeVisible();
  });

  test('should bulk approve wines', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    const wine1 = await db.createTestWine(seller.id, { title: 'Wine 1' });
    const wine2 = await db.createTestWine(seller.id, { title: 'Wine 2' });
    
    await page.goto('/admin/wines');
    
    // Select multiple wines
    await page.check(`[data-testid="wine-checkbox-${wine1.id}"]`);
    await page.check(`[data-testid="wine-checkbox-${wine2.id}"]`);
    
    // Bulk approve
    await page.click('[data-testid="bulk-approve-button"]');
    
    await expect(page.locator('text=2 wines approved successfully')).toBeVisible();
  });

  test('should view seller information from wine listing', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser({
      username: 'wineseller',
      firstName: 'Wine',
      lastName: 'Seller',
    });
    const wine = await db.createTestWine(seller.id);
    
    await page.goto(`/admin/wines/${wine.id}`);
    
    // Should show seller information
    await expect(page.locator('[data-testid="seller-info"]')).toBeVisible();
    await expect(page.locator('text=wineseller')).toBeVisible();
    await expect(page.locator('text=Wine Seller')).toBeVisible();
    
    // Should have link to seller profile
    await page.click('[data-testid="view-seller-button"]');
    await expect(page).toHaveURL(`/admin/users/${seller.id}`);
  });

  test('should display wine statistics', async ({ page }) => {
    await auth.loginAsAdmin();
    
    await page.goto('/admin/wines');
    
    // Should show wine moderation statistics
    await expect(page.locator('[data-testid="wines-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-wines"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-wines"]')).toBeVisible();
    await expect(page.locator('[data-testid="approved-wines"]')).toBeVisible();
    await expect(page.locator('[data-testid="rejected-wines"]')).toBeVisible();
  });

  test('should flag inappropriate wines', async ({ page }) => {
    await auth.loginAsAdmin();
    
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      title: 'Suspicious Wine',
    });
    
    await page.goto(`/admin/wines/${wine.id}`);
    
    await page.click('[data-testid="flag-wine-button"]');
    await page.fill('[data-testid="flag-reason-input"]', 'Suspicious listing');
    await page.click('[data-testid="confirm-flag-button"]');
    
    await expect(page.locator('text=Wine flagged successfully')).toBeVisible();
    await expect(page.locator('[data-testid="wine-flags"]')).toContainText('Flagged');
  });
});