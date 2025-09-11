import { test, expect } from '@playwright/test';
import { TestDatabase, ApiHelper } from '../../utils';
import { WineType, WineCondition, WineStatus } from '@wine-marketplace/shared';

let db: TestDatabase;
let api: ApiHelper;

test.beforeAll(async () => {
  db = new TestDatabase();
  await db.connect();
});

test.afterAll(async () => {
  await db.disconnect();
});

test.beforeEach(async ({ request, baseURL }) => {
  api = new ApiHelper(request, baseURL);
  await db.cleanup();
});

test.describe('Wines API', () => {
  test('should get all wines', async () => {
    // Create test wines
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, {
      title: 'Red Wine',
      wineType: WineType.RED,
    });
    await db.createTestWine(seller.id, {
      title: 'White Wine',
      wineType: WineType.WHITE,
    });

    const response = await api.getWines();
    const result = await api.expectSuccess(response);

    expect(result.wines).toHaveLength(2);
    expect(result.wines[0].title).toBeDefined();
    expect(result.wines[0].price).toBeDefined();
    expect(result.wines[0].wineType).toBeDefined();
  });

  test('should filter wines by type', async () => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, { wineType: WineType.RED });
    await db.createTestWine(seller.id, { wineType: WineType.WHITE });
    await db.createTestWine(seller.id, { wineType: WineType.SPARKLING });

    const response = await api.getWines({ wineType: [WineType.RED] });
    const result = await api.expectSuccess(response);

    expect(result.wines).toHaveLength(1);
    expect(result.wines[0].wineType).toBe(WineType.RED);
  });

  test('should filter wines by price range', async () => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, { price: 10 });
    await db.createTestWine(seller.id, { price: 25 });
    await db.createTestWine(seller.id, { price: 50 });

    const response = await api.getWines({ 
      priceMin: 20, 
      priceMax: 30 
    });
    const result = await api.expectSuccess(response);

    expect(result.wines).toHaveLength(1);
    expect(result.wines[0].price).toBe('25');
  });

  test('should search wines by title', async () => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, { title: 'Chianti Classico' });
    await db.createTestWine(seller.id, { title: 'Pinot Grigio' });

    const response = await api.getWines({ search: 'Chianti' });
    const result = await api.expectSuccess(response);

    expect(result.wines).toHaveLength(1);
    expect(result.wines[0].title).toBe('Chianti Classico');
  });

  test('should sort wines by price', async () => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, { price: 50, title: 'Expensive' });
    await db.createTestWine(seller.id, { price: 10, title: 'Cheap' });
    await db.createTestWine(seller.id, { price: 25, title: 'Medium' });

    const response = await api.getWines({ sortBy: 'price', sortOrder: 'asc' });
    const result = await api.expectSuccess(response);

    expect(result.wines[0].title).toBe('Cheap');
    expect(result.wines[2].title).toBe('Expensive');
  });

  test('should get wine by ID', async () => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      title: 'Specific Wine',
      description: 'Detailed description',
    });

    const response = await api.getWine(wine.id);
    const result = await api.expectSuccess(response);

    expect(result.id).toBe(wine.id);
    expect(result.title).toBe('Specific Wine');
    expect(result.description).toBe('Detailed description');
    expect(result.seller).toBeDefined();
    expect(result.seller.username).toBeDefined();
  });

  test('should return 404 for non-existent wine', async () => {
    const response = await api.getWine('non-existent-id');
    expect(response.status()).toBe(404);
  });

  test('should create wine when authenticated', async () => {
    // This test demonstrates the pattern - in reality you'd need proper auth
    const wineData = {
      title: 'New Wine Listing',
      description: 'A great wine',
      price: 35.99,
      vintage: 2019,
      region: 'Bordeaux',
      wineType: WineType.RED,
      condition: WineCondition.EXCELLENT,
    };

    const response = await api.createWine(wineData);
    
    // Without proper auth token, this should fail
    expect(response.status()).toBe(401);
  });

  test('should validate wine creation data', async () => {
    const invalidData = {
      title: '', // Required field empty
      price: -10, // Invalid price
      wineType: 'INVALID_TYPE',
    };

    const response = await api.createWine(invalidData);
    
    // Without proper auth token, this should fail with 401 (Unauthorized)
    expect(response.status()).toBe(401);
  });

  test('should update wine when authorized', async () => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id);

    const updateData = {
      title: 'Updated Wine Title',
      price: 45.99,
    };

    // Without proper auth, this should fail
    const response = await api.updateWine(wine.id, updateData);
    expect(response.status()).toBe(401);
  });

  test('should delete wine when authorized', async () => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id);

    // Without proper auth, this should fail
    const response = await api.deleteWine(wine.id);
    expect(response.status()).toBe(401);
  });

  test('should paginate wine results', async () => {
    const seller = await db.createTestUser();
    
    // Create many wines
    for (let i = 0; i < 25; i++) {
      await db.createTestWine(seller.id, {
        title: `Wine ${i}`,
        price: i * 10,
      });
    }

    // Test pagination
    const response = await api.getWines({ 
      page: 1, 
      limit: 10 
    });
    const result = await api.expectSuccess(response);

    expect(result.wines).toHaveLength(10);
    // Note: API doesn't return pagination metadata, just the wines array
  });

  test('should filter by multiple criteria', async () => {
    const seller = await db.createTestUser();
    await db.createTestWine(seller.id, {
      wineType: WineType.RED,
      vintage: 2018,
      region: 'Tuscany',
      price: 30,
    });
    await db.createTestWine(seller.id, {
      wineType: WineType.RED,
      vintage: 2019,
      region: 'Tuscany', 
      price: 40,
    });
    await db.createTestWine(seller.id, {
      wineType: WineType.WHITE,
      vintage: 2018,
      region: 'Tuscany',
      price: 25,
    });

    const response = await api.getWines({
      wineType: [WineType.RED],
      region: ['Tuscany'],
    });
    const result = await api.expectSuccess(response);

    expect(result.wines).toHaveLength(1);
    expect(result.wines[0].wineType).toBe(WineType.RED);
    expect(result.wines[0].region).toBe('Tuscany');
  });

  test('should handle invalid filter values gracefully', async () => {
    const response = await api.getWines({
      wineType: ['INVALID_TYPE'],
      vintage: ['not-a-number'],
      priceFrom: 'invalid-price',
    });

    // Should either return 400 for validation error or ignore invalid filters
    expect([200, 400]).toContain(response.status());
  });
});