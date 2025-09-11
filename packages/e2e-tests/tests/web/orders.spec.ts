import { test, expect } from '@playwright/test';
import { TestDatabase, AuthHelper } from '../../utils';
import { OrderStatus } from '@wine-marketplace/shared';

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

test.describe('Orders and Purchasing', () => {
  test('should create order for wine purchase', async ({ page }) => {
    // Setup: Create seller, buyer, and wine
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      title: 'Wine for Purchase',
      price: 39.99,
    });
    
    const buyer = await auth.loginAsUser();
    
    // Create shipping address
    await db.createTestShippingAddress(buyer!.id);
    
    // Go to wine details and purchase
    await page.goto(`/wines/${wine.id}`);
    await page.click('[data-testid="buy-now-button"]');
    
    // Should be on checkout page
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('text=Wine for Purchase')).toBeVisible();
    await expect(page.locator('text=39.99')).toBeVisible();
    
    // Complete checkout
    await page.click('[data-testid="place-order-button"]');
    
    // Should redirect to order confirmation
    await expect(page).toHaveURL(/\/orders\/[^\/]+/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('should add wine to cart and checkout multiple items', async ({ page }) => {
    const seller = await db.createTestUser();
    const wine1 = await db.createTestWine(seller.id, {
      title: 'First Wine',
      price: 25.99,
    });
    const wine2 = await db.createTestWine(seller.id, {
      title: 'Second Wine',
      price: 35.99,
    });
    
    const buyer = await auth.loginAsUser();
    await db.createTestShippingAddress(buyer!.id);
    
    // Add first wine to cart
    await page.goto(`/wines/${wine1.id}`);
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Add second wine to cart
    await page.goto(`/wines/${wine2.id}`);
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL('/cart');
    
    // Should see both items
    await expect(page.locator('text=First Wine')).toBeVisible();
    await expect(page.locator('text=Second Wine')).toBeVisible();
    await expect(page.locator('text=61.98')).toBeVisible(); // Total price
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    await page.click('[data-testid="place-order-button"]');
    
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('should view order history', async ({ page }) => {
    const seller = await db.createTestUser();
    const buyer = await auth.loginAsUser();
    const wine = await db.createTestWine(seller.id);
    
    // Create test order
    await db.createTestOrder(seller.id, buyer!.id, wine.id);
    
    await page.goto('/orders');
    
    // Should see order in history
    await expect(page.locator('[data-testid="order-item"]')).toBeVisible();
    await expect(page.locator('text=49.99')).toBeVisible();
  });

  test('should track order status updates', async ({ page }) => {
    const seller = await db.createTestUser();
    const buyer = await auth.loginAsUser();
    const wine = await db.createTestWine(seller.id);
    
    const order = await db.createTestOrder(seller.id, buyer!.id, wine.id, {
      status: OrderStatus.CONFIRMED,
    });
    
    await page.goto(`/orders/${order.id}`);
    
    // Should show current status
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Confirmed');
    
    // Should show order timeline
    await expect(page.locator('[data-testid="order-timeline"]')).toBeVisible();
  });

  test('should allow seller to update order status', async ({ page }) => {
    const seller = await auth.loginAsUser();
    const buyer = await db.createTestUser();
    const wine = await db.createTestWine(seller!.id);
    
    const order = await db.createTestOrder(seller!.id, buyer.id, wine.id);
    
    // Navigate to seller's order management
    await page.goto('/dashboard/orders');
    await page.click(`[data-testid="order-${order.id}"]`);
    
    // Update status to shipped
    await page.selectOption('[data-testid="status-select"]', OrderStatus.SHIPPED);
    await page.fill('[data-testid="tracking-number-input"]', 'TRACK123456');
    await page.click('[data-testid="update-status-button"]');
    
    await expect(page.locator('text=Order status updated')).toBeVisible();
  });

  test('should calculate shipping costs correctly', async ({ page }) => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id, {
      price: 50.00,
    });
    
    const buyer = await auth.loginAsUser();
    await db.createTestShippingAddress(buyer!.id);
    
    await page.goto(`/wines/${wine.id}`);
    await page.click('[data-testid="buy-now-button"]');
    
    // Should show price breakdown
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('50.00');
    await expect(page.locator('[data-testid="shipping-cost"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });

  test('should require shipping address for checkout', async ({ page }) => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id);
    
    await auth.loginAsUser();
    
    await page.goto(`/wines/${wine.id}`);
    await page.click('[data-testid="buy-now-button"]');
    
    // Should prompt to add shipping address
    await expect(page.locator('text=Add Shipping Address')).toBeVisible();
    
    // Add shipping address
    await page.click('[data-testid="add-address-button"]');
    await page.fill('[data-testid="firstName-input"]', 'John');
    await page.fill('[data-testid="lastName-input"]', 'Doe');
    await page.fill('[data-testid="address1-input"]', '123 Test St');
    await page.fill('[data-testid="city-input"]', 'Test City');
    await page.fill('[data-testid="zipCode-input"]', '12345');
    await page.selectOption('[data-testid="country-select"]', 'US');
    
    await page.click('[data-testid="save-address-button"]');
    
    // Should now be able to complete checkout
    await expect(page.locator('[data-testid="place-order-button"]')).toBeEnabled();
  });

  test('should prevent buying own wine', async ({ page }) => {
    const seller = await auth.loginAsUser();
    const wine = await db.createTestWine(seller!.id);
    
    await page.goto(`/wines/${wine.id}`);
    
    // Buy button should be disabled or not visible
    await expect(page.locator('[data-testid="buy-now-button"]')).not.toBeVisible();
    await expect(page.locator('text=You cannot purchase your own listing')).toBeVisible();
  });

  test('should handle payment processing', async ({ page }) => {
    const seller = await db.createTestUser();
    const wine = await db.createTestWine(seller.id);
    
    const buyer = await auth.loginAsUser();
    await db.createTestShippingAddress(buyer!.id);
    
    await page.goto(`/wines/${wine.id}`);
    await page.click('[data-testid="buy-now-button"]');
    
    // Should show payment options
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible();
    
    // Select PayPal (mock)
    await page.click('[data-testid="paypal-option"]');
    await page.click('[data-testid="place-order-button"]');
    
    // Should redirect to payment processor (mocked)
    await expect(page.locator('text=Processing Payment')).toBeVisible();
  });
});