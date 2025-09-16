import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { PaymentService } from './payment.service';
import { CreateOrderDto, UpdateOrderStatusDto, ProcessPaymentDto, OrderFiltersDto } from './dto/order.dto';
import { OrderStatus, PaymentStatus, WineStatus, PaymentProvider } from '@wine-marketplace/shared';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyerId: string): Promise<any> {
    const { items, shippingAddressId, shippingAddress, paymentProvider } = createOrderDto;

    // Validate wines availability and calculate totals
    const wineItems = await this.validateAndCalculateOrder(items);
    
    // Handle shipping address
    let addressId = shippingAddressId;
    if (!addressId && shippingAddress) {
      const createdAddress = await this.prisma.shippingAddress.create({
        data: {
          ...shippingAddress,
          userId: buyerId,
        },
      });
      addressId = createdAddress.id;
    }

    if (!addressId) {
      throw new BadRequestException('Shipping address is required');
    }

    // Create order with items
    const orderNumber = `WM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        sellerId: wineItems[0].wine.sellerId, // For now, single seller per order
        status: OrderStatus.PENDING,
        totalAmount: wineItems.reduce((sum, item) => sum + item.total, 0),
        shippingCost: 8.50, // Fixed shipping for now
        shippingAddressId: addressId,
        paymentProvider,
        paymentStatus: PaymentStatus.PENDING,
        items: {
          create: wineItems.map(item => ({
            wineId: item.wine.id,
            quantity: item.quantity,
            price: item.wine.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
        shippingAddress: true,
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return order;
  }

  async findMany(filters: OrderFiltersDto = {}, userId?: string, userRole?: string): Promise<any> {
    const {
      status,
      paymentStatus,
      sellerId,
      buyerId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: any = {};

    // Apply filters
    if (status && status.length > 0) {
      where.status = { in: status };
    }

    if (paymentStatus && paymentStatus.length > 0) {
      where.paymentStatus = { in: paymentStatus };
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (buyerId) {
      where.buyerId = buyerId;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // User access control
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userId) {
      where.OR = [
        { buyerId: userId },
        { sellerId: userId },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          items: {
            include: {
              wine: true,
            },
          },
          shippingAddress: true,
          seller: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              verified: true,
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              verified: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string, userRole?: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
        shippingAddress: true,
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            email: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            email: true,
          },
        },
        refundRequests: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check access permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userId) {
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new ForbiddenException('You can only access your own orders');
      }
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string, userRole: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only seller or admin can update order status
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && order.sellerId !== userId) {
      throw new ForbiddenException('Only the seller or admin can update order status');
    }

    const { status, trackingNumber, estimatedDelivery, shippingLabelUrl } = updateOrderStatusDto;

    // Generate shipping label if status is SHIPPED and no tracking number provided
    let shippingData = {};
    if (status === OrderStatus.SHIPPED && !trackingNumber) {
      const shippingResult = await this.paymentService.generateShippingLabel(id, {});
      if (shippingResult.success) {
        shippingData = {
          trackingNumber: shippingResult.trackingNumber,
          shippingLabelUrl: shippingResult.labelUrl,
          estimatedDelivery: shippingResult.estimatedDelivery,
        };
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        trackingNumber: trackingNumber || shippingData['trackingNumber'],
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : shippingData['estimatedDelivery'],
        shippingLabelUrl: shippingLabelUrl || shippingData['shippingLabelUrl'],
        ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
      },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
        seller: true,
        buyer: true,
      },
    });

    // Mark wines as sold if order is completed
    if (status === OrderStatus.DELIVERED) {
      await this.markWinesAsSold(updatedOrder.items);
    }

    return updatedOrder;
  }

  async processPayment(id: string, processPaymentDto: ProcessPaymentDto, userId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { 
        buyerId: true, 
        totalAmount: true, 
        shippingCost: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== userId) {
      throw new ForbiddenException('You can only pay for your own orders');
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Order has already been paid');
    }

    const totalAmount = order.totalAmount.toNumber() + (order.shippingCost?.toNumber() || 0);
    
    const paymentResult = await this.paymentService.processPayment(
      id,
      totalAmount,
      processPaymentDto.paymentProvider,
      processPaymentDto.paymentData,
    );

    // Update order with payment result
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        paymentId: processPaymentDto.paymentId,
        paymentProvider: processPaymentDto.paymentProvider,
        paymentStatus: paymentResult.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        status: paymentResult.success ? OrderStatus.PAID : OrderStatus.CANCELLED,
      },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
        seller: true,
        buyer: true,
      },
    });

    return {
      order: updatedOrder,
      payment: paymentResult,
    };
  }

  async cancelOrder(id: string, userId: string, userRole: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { 
        buyerId: true, 
        sellerId: true,
        status: true,
        paymentStatus: true,
        paymentId: true,
        paymentProvider: true,
        totalAmount: true,
        shippingCost: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new ForbiddenException('You can only cancel your own orders');
      }
    }

    // Check if cancellation is allowed
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel shipped or delivered orders');
    }

    // Process refund if payment was completed
    let refundResult = null;
    if (order.paymentStatus === PaymentStatus.COMPLETED && order.paymentId && order.paymentProvider) {
      const refundAmount = order.totalAmount.toNumber() + (order.shippingCost?.toNumber() || 0);
      refundResult = await this.paymentService.refundPayment(
        order.paymentId,
        refundAmount,
        order.paymentProvider as any,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: refundResult?.success ? PaymentStatus.REFUNDED : order.paymentStatus,
      },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
        seller: true,
        buyer: true,
      },
    });

    return {
      order: updatedOrder,
      refund: refundResult,
    };
  }

  private async validateAndCalculateOrder(items: { wineId: string; quantity: number }[]): Promise<any> {
    const wineItems = [];

    for (const item of items) {
      const wine = await this.prisma.wine.findUnique({
        where: { id: item.wineId },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!wine) {
        throw new NotFoundException(`Wine with ID ${item.wineId} not found`);
      }

      if (wine.status !== WineStatus.ACTIVE) {
        throw new BadRequestException(`Wine "${wine.title}" is not available for purchase`);
      }

      if (wine.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient quantity for wine "${wine.title}". Available: ${wine.quantity}, Requested: ${item.quantity}`
        );
      }

      wineItems.push({
        wine,
        quantity: item.quantity,
        unitPrice: wine.price,
        total: wine.price.toNumber() * item.quantity,
      });
    }

    return wineItems;
  }

  private async markWinesAsSold(orderItems: any[]): Promise<any> {
    for (const item of orderItems) {
      const remainingQuantity = item.wine.quantity - item.quantity;
      
      await this.prisma.wine.update({
        where: { id: item.wine.id },
        data: {
          quantity: remainingQuantity,
          status: remainingQuantity === 0 ? WineStatus.SOLD : item.wine.status,
          ...(remainingQuantity === 0 && { soldAt: new Date() }),
        },
      });
    }
  }

  // Cart methods
  async getCart(userId: string): Promise<any> {
    console.log('🛒 ENTRY: getCart method started for userId:', userId);
    console.log('🛒 DEBUG: This is the NEW version of getCart method');

    // Find all cart orders for the user (multi-seller support)
    const cartOrders = await this.prisma.order.findMany({
      where: {
        buyerId: userId,
        status: OrderStatus.PENDING,
      },
      include: {
        items: {
          include: {
            wine: {
              include: {
                seller: true,
              },
            },
          },
        },
        seller: true,
      },
    });

    console.log('🛒 Found cart orders:', cartOrders.length);

    if (cartOrders.length === 0) {
      console.log('🛒 No cart orders found - returning empty cart');
      const emptyResult = {
        sellers: [],
        totalAmount: 0,
        totalItems: 0,
        shippingCost: 0,
        grandTotal: 0,
      };
      return emptyResult;
    }

    // Group by seller
    const sellerCarts = cartOrders.map(cartOrder => {
      const items = cartOrder.items.map(item => ({
        id: item.id,
        wineId: item.wineId,
        quantity: item.quantity,
        price: item.price.toNumber(),
        subtotal: item.price.toNumber() * item.quantity,
        wine: {
          id: item.wine.id,
          title: item.wine.title,
          annata: item.wine.annata,
          region: item.wine.region,
          country: item.wine.country,
          images: item.wine.images,
          wineType: item.wine.wineType,
        },
      }));

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const shippingCost = this.calculateShippingForSeller(subtotal, itemCount);

      return {
        seller: {
          id: cartOrder.seller.id,
          username: cartOrder.seller.username,
          firstName: cartOrder.seller.firstName,
          lastName: cartOrder.seller.lastName,
        },
        orderId: cartOrder.id,
        items,
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
      };
    });

    // Calculate totals
    const totalItems = sellerCarts.reduce((sum, cart) => sum + cart.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const totalAmount = sellerCarts.reduce((sum, cart) => sum + cart.subtotal, 0);
    const totalShipping = sellerCarts.reduce((sum, cart) => sum + cart.shippingCost, 0);
    const grandTotal = totalAmount + totalShipping;

    const result = {
      sellers: sellerCarts,
      totalAmount,
      totalItems,
      shippingCost: totalShipping,
      grandTotal,
    };

    console.log('🛒 EXIT: getCart method returning result with', sellerCarts.length, 'sellers and', totalItems, 'total items');
    return result;
  }

  private calculateShippingForSeller(subtotal: number, itemCount: number): number {
    // Basic shipping calculation - can be made more sophisticated
    if (subtotal >= 50) return 0; // Free shipping over €50
    if (itemCount === 1) return 8; // €8 for single item
    return Math.min(8 + (itemCount - 1) * 3, 15); // €8 base + €3 per additional item, max €15
  }

  async addToCart(userId: string, createOrderItemDto: { wineId: string; quantity: number }): Promise<any> {
    console.log('🛒 Backend addToCart called for userId:', userId, 'wineId:', createOrderItemDto.wineId, 'quantity:', createOrderItemDto.quantity);

    const { wineId, quantity } = createOrderItemDto;

    // Validate wine
    const wine = await this.prisma.wine.findUnique({
      where: { id: wineId },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    if (wine.status !== WineStatus.ACTIVE) {
      throw new BadRequestException('Wine is not available for purchase');
    }

    // Prevent users from buying their own wines
    if (wine.sellerId === userId) {
      throw new BadRequestException('Cannot purchase your own wine');
    }

    if (wine.quantity < quantity) {
      throw new BadRequestException(`Insufficient quantity. Available: ${wine.quantity}, Requested: ${quantity}`);
    }

    // Get or create cart for this specific seller (multi-seller approach)
    let cart = await this.prisma.order.findFirst({
      where: {
        buyerId: userId,
        sellerId: wine.sellerId,
        status: OrderStatus.PENDING,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      const orderNumber = `CART-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      cart = await this.prisma.order.create({
        data: {
          orderNumber,
          buyerId: userId,
          sellerId: wine.sellerId,
          status: OrderStatus.PENDING,
          totalAmount: 0,
          paymentStatus: PaymentStatus.PENDING,
        },
        include: {
          items: true,
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.wineId === wineId);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (wine.quantity < newQuantity) {
        throw new BadRequestException(`Insufficient quantity. Available: ${wine.quantity}, Total requested: ${newQuantity}`);
      }

      await this.prisma.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await this.prisma.orderItem.create({
        data: {
          orderId: cart.id,
          wineId,
          quantity,
          price: wine.price,
        },
      });
    }

    // Update cart total
    const updatedCart = await this.prisma.order.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            wine: {
              include: {
                seller: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const cartTotal = updatedCart.items.reduce((sum, item) => sum + (item.price.toNumber() * item.quantity), 0);
    
    await this.prisma.order.update({
      where: { id: cart.id },
      data: { totalAmount: cartTotal },
    });

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, wineId: string, quantity: number): Promise<any> {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // First get wine to find the seller
    const wine = await this.prisma.wine.findUnique({
      where: { id: wineId },
      select: { 
        id: true, 
        sellerId: true, 
        quantity: true, 
        status: true 
      },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    if (wine.status !== WineStatus.ACTIVE) {
      throw new BadRequestException('Wine is not available');
    }

    // Find the seller-specific cart
    const cart = await this.prisma.order.findFirst({
      where: {
        buyerId: userId,
        sellerId: wine.sellerId,
        status: OrderStatus.PENDING,
      },
      include: {
        items: {
          where: { wineId },
          include: {
            wine: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Item not found in cart');
    }

    const cartItem = cart.items[0];

    if (wine.quantity < quantity) {
      throw new BadRequestException(`Insufficient quantity. Available: ${wine.quantity}, Requested: ${quantity}`);
    }

    await this.prisma.orderItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    // Update cart total
    const updatedCart = await this.prisma.order.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    const cartTotal = updatedCart.items.reduce((sum, item) => sum + (item.price.toNumber() * item.quantity), 0);
    
    await this.prisma.order.update({
      where: { id: cart.id },
      data: { totalAmount: cartTotal },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, wineId: string): Promise<any> {
    // First get wine to find the seller
    const wine = await this.prisma.wine.findUnique({
      where: { id: wineId },
      select: { id: true, sellerId: true },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    // Find the seller-specific cart
    const cart = await this.prisma.order.findFirst({
      where: {
        buyerId: userId,
        sellerId: wine.sellerId,
        status: OrderStatus.PENDING,
      },
      include: {
        items: {
          where: { wineId },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Item not found in cart');
    }

    const cartItem = cart.items[0];
    
    await this.prisma.orderItem.delete({
      where: { id: cartItem.id },
    });

    // Update cart total
    const updatedCart = await this.prisma.order.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    const cartTotal = updatedCart.items.reduce((sum, item) => sum + (item.price.toNumber() * item.quantity), 0);
    
    await this.prisma.order.update({
      where: { id: cart.id },
      data: { totalAmount: cartTotal },
    });

    // If cart is empty, delete it
    if (updatedCart.items.length === 0) {
      await this.prisma.order.delete({
        where: { id: cart.id },
      });
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<any> {
    // Find all pending carts for the user (multi-seller)
    const carts = await this.prisma.order.findMany({
      where: {
        buyerId: userId,
        status: OrderStatus.PENDING,
      },
      include: { items: true },
    });

    if (carts.length === 0) {
      throw new NotFoundException('Cart not found');
    }

    // Delete all cart items from all seller carts
    for (const cart of carts) {
      await this.prisma.orderItem.deleteMany({
        where: { orderId: cart.id },
      });
    }

    // Delete all empty cart orders
    await this.prisma.order.deleteMany({
      where: {
        buyerId: userId,
        status: OrderStatus.PENDING,
      },
    });

    return this.getCart(userId);
  }

  async checkoutCart(userId: string, checkoutData: { shippingAddressId?: string; shippingAddress?: any; paymentProvider: string }): Promise<any> {
    // Get all pending carts for the user (multi-seller)
    const carts = await this.prisma.order.findMany({
      where: {
        buyerId: userId,
        status: OrderStatus.PENDING,
      },
      include: {
        items: {
          include: {
            wine: true,
          },
        },
        seller: true,
      },
    });

    if (carts.length === 0 || carts.every(cart => cart.items.length === 0)) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate all items are still available across all seller carts
    for (const cart of carts) {
      for (const item of cart.items) {
        const wine = await this.prisma.wine.findUnique({
          where: { id: item.wineId },
        });

        if (!wine || wine.status !== WineStatus.ACTIVE) {
          throw new BadRequestException(`Wine "${item.wine.title}" is no longer available`);
        }

        if (wine.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient quantity for wine "${wine.title}". Available: ${wine.quantity}, In cart: ${item.quantity}`
          );
        }
      }
    }

    // Handle shipping address
    const { shippingAddressId, shippingAddress, paymentProvider } = checkoutData;
    let addressId = shippingAddressId;
    
    if (!addressId && shippingAddress) {
      const createdAddress = await this.prisma.shippingAddress.create({
        data: {
          ...shippingAddress,
          userId,
        },
      });
      addressId = createdAddress.id;
    }

    if (!addressId) {
      throw new BadRequestException('Shipping address is required');
    }

    // Generate batch ID to link all orders from this checkout
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Convert each seller cart to a separate order
    const orders = [];
    
    for (const cart of carts) {
      if (cart.items.length === 0) continue;

      // Calculate shipping cost for this seller
      const cartSubtotal = cart.items.reduce((sum, item) => sum + (item.price.toNumber() * item.quantity), 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const shippingCost = this.calculateShippingForSeller(cartSubtotal, itemCount);
      const totalAmount = cartSubtotal + shippingCost;

      // Generate unique order number for each seller
      const orderNumber = `WM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const order = await this.prisma.order.update({
        where: { id: cart.id },
        data: {
          orderNumber,
          batchId,
          status: OrderStatus.CONFIRMED,
          shippingAddressId: addressId,
          paymentProvider: paymentProvider as PaymentProvider,
          shippingCost,
          totalAmount,
        },
        include: {
          items: {
            include: {
              wine: true,
            },
          },
          shippingAddress: true,
          seller: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      orders.push(order);
    }

    // Return summary of all created orders
    return {
      batchId,
      totalOrders: orders.length,
      orders,
      grandTotal: orders.reduce((sum, order) => sum + order.totalAmount.toNumber(), 0),
    };
  }
}