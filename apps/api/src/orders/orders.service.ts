import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { PaymentService } from './payment.service';
import { CreateOrderDto, UpdateOrderStatusDto, ProcessPaymentDto, OrderFiltersDto } from './dto/order.dto';
import { OrderStatus, PaymentStatus, WineStatus } from '@wine-marketplace/shared';

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
}