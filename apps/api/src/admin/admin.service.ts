import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { 
  ProcessRefundDto, 
  CreateRefundRequestDto, 
  UpdateUserStatusDto, 
  UpdateWineStatusDto,
  AdminFiltersDto,
  RefundFiltersDto 
} from './dto/admin.dto';
import { 
  AdminAction, 
  RefundStatus, 
  OrderStatus,
  WineStatus,
  UserRole 
} from '@wine-marketplace/shared';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<any> {
    const [
      totalUsers,
      totalWines,
      totalOrders,
      totalRevenue,
      pendingRefunds,
      activeDisputes,
      recentSignups,
      recentSales,
      pendingWines,
      activeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.wine.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED },
        _sum: { totalAmount: true },
      }),
      this.prisma.refundRequest.count({
        where: { status: RefundStatus.PENDING },
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.DISPUTED },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.order.count({
        where: {
          status: OrderStatus.DELIVERED,
          deliveredAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.wine.count({
        where: { status: WineStatus.INACTIVE }, // Assuming inactive wines need approval
      }),
      this.prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalWines,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingRefunds,
      activeDisputes,
      recentSignups,
      recentSales,
      pendingWines,
      activeUsers,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string): Promise<any> {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, Math.min(100, limit));
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          verified: true,
          banned: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              wines: true,
              orders: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  async updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto, adminId: string): Promise<any> {
    const { banned, verified, role, adminNotes } = updateUserStatusDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, banned: true, verified: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(banned !== undefined && { banned }),
        ...(verified !== undefined && { verified }),
        ...(role !== undefined && { role }),
      },
    });

    // Log admin actions
    const actions = [];
    if (banned !== undefined && banned !== user.banned) {
      actions.push(banned ? AdminAction.USER_BANNED : AdminAction.USER_UNBANNED);
    }
    if (verified !== undefined && verified !== user.verified) {
      actions.push(AdminAction.USER_VERIFIED);
    }

    for (const action of actions) {
      await this.prisma.adminLog.create({
        data: {
          action,
          details: adminNotes,
          targetType: 'user',
          targetId: userId,
          adminId,
        },
      });
    }

    return updatedUser;
  }

  async updateUser(userId: string, updateUserStatusDto: UpdateUserStatusDto, adminId: string): Promise<any> {
    const { banned, verified, role, adminNotes } = updateUserStatusDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, banned: true, verified: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(banned !== undefined && { banned }),
        ...(verified !== undefined && { verified }),
        ...(role !== undefined && { role }),
      },
    });

    // Log admin actions
    const actions = [];
    if (banned !== undefined && banned !== user.banned) {
      actions.push(banned ? AdminAction.USER_BANNED : AdminAction.USER_UNBANNED);
    }
    if (verified !== undefined && verified !== user.verified) {
      actions.push(AdminAction.USER_VERIFIED);
    }

    for (const action of actions) {
      await this.prisma.adminLog.create({
        data: {
          action,
          details: adminNotes,
          targetType: 'user',
          targetId: userId,
          adminId,
        },
      });
    }

    return updatedUser;
  }

  async getWines(page = 1, limit = 20, status?: WineStatus): Promise<any> {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, Math.min(100, limit));
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [wines, total] = await Promise.all([
      this.prisma.wine.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              verified: true,
            },
          },
        },
      }),
      this.prisma.wine.count({ where }),
    ]);

    return {
      wines,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  async updateWineStatus(wineId: string, updateWineStatusDto: UpdateWineStatusDto, adminId: string): Promise<any> {
    const { status, adminNotes } = updateWineStatusDto;

    const wine = await this.prisma.wine.findUnique({
      where: { id: wineId },
      select: { id: true, title: true, status: true },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    const updatedWine = await this.prisma.wine.update({
      where: { id: wineId },
      data: { status },
    });

    // Log admin action
    const action = status === WineStatus.ACTIVE ? AdminAction.WINE_APPROVED : AdminAction.WINE_REJECTED;
    await this.prisma.adminLog.create({
      data: {
        action,
        details: adminNotes || `Wine "${wine.title}" status changed to ${status}`,
        targetType: 'wine',
        targetId: wineId,
        adminId,
      },
    });

    return updatedWine;
  }

  async getOrders(page = 1, limit = 20, status?: OrderStatus): Promise<any> {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, Math.min(100, limit));
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              verified: true,
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              verified: true,
            },
          },
          items: {
            include: {
              wine: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  async getRefunds(filters: RefundFiltersDto = {}): Promise<any> {
    const {
      status,
      reason,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, Math.min(100, limit));
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {};

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    if (reason && reason.length > 0) {
      where.reason = { in: reason };
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [refunds, total] = await Promise.all([
      this.prisma.refundRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          order: {
            include: {
              items: {
                include: {
                  wine: {
                    select: {
                      id: true,
                      title: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.refundRequest.count({ where }),
    ]);

    return {
      refunds,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  async processRefund(refundId: string, processRefundDto: ProcessRefundDto, adminId: string): Promise<any> {
    const { status, adminNotes } = processRefundDto;

    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: true,
        user: true,
      },
    });

    if (!refund) {
      throw new NotFoundException('Refund request not found');
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Refund has already been processed');
    }

    // Update refund request
    const updatedRefund = await this.prisma.refundRequest.update({
      where: { id: refundId },
      data: {
        status,
        adminNotes,
        processedAt: new Date(),
      },
    });

    // Log admin action
    const action = status === RefundStatus.APPROVED ? AdminAction.REFUND_APPROVED : AdminAction.REFUND_DENIED;
    await this.prisma.adminLog.create({
      data: {
        action,
        details: adminNotes || `Refund for order ${refund.order.orderNumber} ${status.toLowerCase()}`,
        targetType: 'refund',
        targetId: refundId,
        adminId,
      },
    });

    // If approved, process the actual refund (integration with payment service would go here)
    if (status === RefundStatus.APPROVED) {
      // This would integrate with payment service to process the actual refund
      console.log(`Processing refund of ${refund.amount} for order ${refund.order.orderNumber}`);
    }

    return updatedRefund;
  }

  async createRefundRequest(createRefundRequestDto: CreateRefundRequestDto, userId: string): Promise<any> {
    const { orderId, reason, details, amount } = createRefundRequestDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true, seller: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== userId) {
      throw new BadRequestException('You can only request refunds for your own orders');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot request refund for cancelled orders');
    }

    // Check if refund request already exists
    const existingRefund = await this.prisma.refundRequest.findFirst({
      where: { orderId },
    });

    if (existingRefund) {
      throw new BadRequestException('Refund request already exists for this order');
    }

    const refundRequest = await this.prisma.refundRequest.create({
      data: {
        reason,
        details,
        amount,
        orderId,
        userId,
        status: RefundStatus.PENDING,
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                wine: {
                  select: {
                    title: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return refundRequest;
  }

  async getAdminLogs(filters: AdminFiltersDto = {}): Promise<any> {
    const {
      action,
      adminId,
      targetType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, Math.min(100, limit));
    const skip = (pageNumber - 1) * limitNumber;
    
    const where: any = {};

    if (action && action.length > 0) {
      where.action = { in: action };
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.adminLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }
}