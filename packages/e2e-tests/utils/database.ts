import { PrismaClient } from '@wine-marketplace/database';
import { UserRole, WineType, WineCondition, WineStatus } from '@wine-marketplace/shared';

export class TestDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async cleanup(): Promise<void> {
    try {
      // Delete in correct order to avoid foreign key constraint violations
      // First delete order items, then orders, then wines, then users
      const testUserFilter = '"email" LIKE \'%test%\' OR "username" LIKE \'test%\' OR "username" LIKE \'user%\' OR "username" LIKE \'login%\'';
      
      // Delete related data first
      await this.prisma.$executeRaw`DELETE FROM "order_items" WHERE "wineId" IN (SELECT "id" FROM "wines" WHERE "sellerId" IN (SELECT "id" FROM "users" WHERE "email" LIKE '%test%' OR "username" LIKE 'test%' OR "username" LIKE 'user%' OR "username" LIKE 'login%'))`;
      await this.prisma.$executeRaw`DELETE FROM "orders" WHERE "sellerId" IN (SELECT "id" FROM "users" WHERE "email" LIKE '%test%' OR "username" LIKE 'test%' OR "username" LIKE 'user%' OR "username" LIKE 'login%') OR "buyerId" IN (SELECT "id" FROM "users" WHERE "email" LIKE '%test%' OR "username" LIKE 'test%' OR "username" LIKE 'user%' OR "username" LIKE 'login%')`;
      await this.prisma.$executeRaw`DELETE FROM "wines" WHERE "sellerId" IN (SELECT "id" FROM "users" WHERE "email" LIKE '%test%' OR "username" LIKE 'test%' OR "username" LIKE 'user%' OR "username" LIKE 'login%')`;
      await this.prisma.$executeRaw`DELETE FROM "users" WHERE "email" LIKE '%test%' OR "username" LIKE 'test%' OR "username" LIKE 'user%' OR "username" LIKE 'login%'`;
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
      // If cleanup fails, just continue - tests should still work
    }
  }

  async createTestUser(overrides: any = {}) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15); // Longer suffix for uniqueness
    return this.prisma.user.create({
      data: {
        email: `test-user-${timestamp}-${randomSuffix}@example.com`,
        username: `test${timestamp}${randomSuffix}`.substring(0, 25), // Longer username limit
        firstName: 'Test',
        lastName: 'User',
        verified: true,
        role: UserRole.USER,
        profileComplete: true,
        hashedPassword: '$2b$10$test.hash.for.Password123',
        ...overrides,
      },
    });
  }

  async createTestAdmin(overrides: any = {}) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    return this.prisma.user.create({
      data: {
        email: `test-admin-${timestamp}-${randomSuffix}@example.com`,
        username: `admin${timestamp}${randomSuffix}`.substring(0, 25),
        firstName: 'Test',
        lastName: 'Admin',
        verified: true,
        role: UserRole.ADMIN,
        profileComplete: true,
        hashedPassword: '$2b$10$test.hash.for.Password123',
        ...overrides,
      },
    });
  }

  async createTestWine(sellerId: string, overrides: any = {}) {
    const timestamp = Date.now();
    return this.prisma.wine.create({
      data: {
        title: `Test Wine ${timestamp}`,
        description: 'A test wine for e2e testing',
        price: 49.99,
        vintage: 2020,
        region: 'Tuscany',
        country: 'Italy',
        producer: 'Test Winery',
        grapeVariety: 'Sangiovese',
        wineType: WineType.RED,
        condition: WineCondition.EXCELLENT,
        status: WineStatus.ACTIVE,
        images: ['https://example.com/wine1.jpg'],
        quantity: 1,
        sellerId,
        ...overrides,
      },
    });
  }

  async createTestOrder(sellerId: string, buyerId: string, wineId: string, overrides: any = {}) {
    const timestamp = Date.now();
    const order = await this.prisma.order.create({
      data: {
        orderNumber: `TEST-${timestamp}`,
        sellerId,
        buyerId,
        totalAmount: 49.99,
        ...overrides,
      },
    });

    await this.prisma.orderItem.create({
      data: {
        orderId: order.id,
        wineId,
        quantity: 1,
        price: 49.99,
      },
    });

    return order;
  }

  async createTestShippingAddress(userId: string, overrides: any = {}) {
    return this.prisma.shippingAddress.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        userId,
        isDefault: true,
        ...overrides,
      },
    });
  }

  // Helper method to get a user by email
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Helper method to get wines by seller
  async getWinesBySeller(sellerId: string) {
    return this.prisma.wine.findMany({
      where: { sellerId },
    });
  }

  // Helper method to get orders by buyer
  async getOrdersByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
      },
    });
  }
}