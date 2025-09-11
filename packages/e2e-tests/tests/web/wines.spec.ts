import { test, expect } from '@playwright/test';
import { TestDatabase, AuthHelper } from '../../utils';
import { WineType, WineCondition } from '@wine-marketplace/shared';

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

test.describe('Wine Marketplace', () => {
  test('should display wine listings on homepage', async ({ page }) => {
    // Create some test wines
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, {
      title: 'Test Red Wine',
      price: 25.99,
      wineType: WineType.RED,
    });
    await db.createTestWine(seller.id, {
      title: 'Test White Wine',
      price: 19.99,
      wineType: WineType.WHITE,
    });

    await page.goto('/');
    
    // Should see wine listings
    await expect(page.locator('[data-testid="wine-card"]')).toHaveCount(2);
    await expect(page.locator('text=Test Red Wine')).toBeVisible();
    await expect(page.locator('text=Test White Wine')).toBeVisible();
  });

  test('should filter wines by type', async ({ page }) => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, {
      title: 'Red Wine',
      wineType: WineType.RED,
    });
    await db.createTestWine(seller.id, {
      title: 'White Wine',
      wineType: WineType.WHITE,
    });

    await page.goto('/');
    
    // Filter by red wines
    await page.selectOption('[data-testid="wine-type-filter"]', WineType.RED);
    await page.click('[data-testid="apply-filters"]');
    
    await expect(page.locator('[data-testid="wine-card"]')).toHaveCount(1);
    await expect(page.locator('text=Red Wine')).toBeVisible();
    await expect(page.locator('text=White Wine')).not.toBeVisible();
  });

  test('should search wines by title', async ({ page }) => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, {
      title: 'Chianti Classico 2019',
    });
    await db.createTestWine(seller.id, {
      title: 'Pinot Grigio 2021',
    });

    await page.goto('/');
    
    // Search for Chianti
    await page.fill('[data-testid="search-input"]', 'Chianti');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="wine-card"]')).toHaveCount(1);
    await expect(page.locator('text=Chianti Classico 2019')).toBeVisible();
  });

  test('should view wine details', async ({ page }) => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      title: 'Premium Wine',
      description: 'A premium wine description',
      vintage: 2018,
      region: 'Tuscany',
      producer: 'Test Winery',
    });

    await page.goto('/');
    await page.click(`[data-testid="wine-card-${wine.id}"]`);
    
    await expect(page).toHaveURL(`/wines/${wine.id}`);
    await expect(page.locator('text=Premium Wine')).toBeVisible();
    await expect(page.locator('text=A premium wine description')).toBeVisible();
    await expect(page.locator('text=2018')).toBeVisible();
    await expect(page.locator('text=Tuscany')).toBeVisible();
  });

  test('should create a wine listing when logged in', async ({ page }) => {
    await auth.loginAsUser();
    
    await page.goto('/wines/new');
    
    // Fill wine form
    await page.fill('[data-testid="title-input"]', 'My Test Wine');
    await page.fill('[data-testid="description-textarea"]', 'Description of my wine');
    await page.fill('[data-testid="price-input"]', '45.99');
    await page.fill('[data-testid="vintage-input"]', '2020');
    await page.fill('[data-testid="region-input"]', 'Bordeaux');
    await page.fill('[data-testid="producer-input"]', 'My Winery');
    await page.selectOption('[data-testid="wine-type-select"]', WineType.RED);
    await page.selectOption('[data-testid="condition-select"]', WineCondition.EXCELLENT);
    
    // Submit form
    await page.click('[data-testid="submit-wine"]');
    
    // Should redirect to wine details or wines list
    await page.waitForURL(/\/wines/);
    await expect(page.locator('text=My Test Wine')).toBeVisible();
  });

  test('should not allow creating wine when not logged in', async ({ page }) => {
    await page.goto('/wines/new');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should edit own wine listing', async ({ page }) => {
    const seller = await auth.loginAsUser();
    const wine = await db.createTestWine(seller!.id);
    
    await page.goto(`/wines/${wine.id}/edit`);
    
    // Update wine details
    await page.fill('[data-testid="title-input"]', 'Updated Wine Title');
    await page.fill('[data-testid="price-input"]', '55.99');
    
    await page.click('[data-testid="update-wine"]');
    
    // Should see updated details
    await expect(page.locator('text=Updated Wine Title')).toBeVisible();
    await expect(page.locator('text=55.99')).toBeVisible();
  });

  test('should not allow editing others wine listings', async ({ page }) => {
    const seller1 = await db.createTestUser();
    const wine = await db.createTestWine(seller1.id);
    
    // Login as different user
    await auth.loginAsUser();
    
    await page.goto(`/wines/${wine.id}/edit`);
    
    // Should show error or redirect
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should add wine to favorites', async ({ page }) => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id);
    
    await auth.loginAsUser();
    await page.goto(`/wines/${wine.id}`);
    
    await page.click('[data-testid="favorite-button"]');
    
    // Should show as favorited
    await expect(page.locator('[data-testid="favorite-button"][data-favorited="true"]')).toBeVisible();
    
    // Check favorites page
    await page.goto('/favorites');
    await expect(page.locator(`[data-testid="wine-card-${wine.id}"]`)).toBeVisible();
  });

  test('should sort wines by price', async ({ page }) => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, { title: 'Expensive Wine', price: 100 });
    await db.createTestWine(seller.id, { title: 'Cheap Wine', price: 10 });
    await db.createTestWine(seller.id, { title: 'Medium Wine', price: 50 });
    
    await page.goto('/');
    
    // Sort by price ascending
    await page.selectOption('[data-testid="sort-select"]', 'price_asc');
    
    const wineCards = page.locator('[data-testid="wine-card"]');
    await expect(wineCards.first()).toContainText('Cheap Wine');
    await expect(wineCards.last()).toContainText('Expensive Wine');
  });
});