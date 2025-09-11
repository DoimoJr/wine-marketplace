import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { UpdateProfileDto, CreateShippingAddressDto, UpdateShippingAddressDto, ChangePasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
        bio: true,
        location: true,
        profileComplete: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async getPublicProfile(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        location: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            wines: true,
            orders: true,
            purchases: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate average rating
    const avgRating = await this.prisma.review.aggregate({
      where: { targetId: id },
      _avg: { rating: true },
    });

    return {
      ...user,
      totalSales: user._count.orders,
      totalPurchases: user._count.purchases,
      averageRating: avgRating._avg.rating || 0,
      totalReviews: user._count.reviewsReceived,
    };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<any> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateProfileDto,
        profileComplete: true, // Mark profile as complete when updated
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        location: true,
        phone: true,
        verified: true,
        profileComplete: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<any> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { hashedPassword: true },
    });

    if (!user || !user.hashedPassword) {
      throw new BadRequestException('User does not have a password set');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { hashedPassword: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getShippingAddresses(userId: string): Promise<any> {
    return this.prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async createShippingAddress(userId: string, createShippingAddressDto: CreateShippingAddressDto): Promise<any> {
    const { isDefault, ...addressData } = createShippingAddressDto;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.shippingAddress.create({
      data: {
        ...addressData,
        isDefault: isDefault || false,
        userId,
      },
    });
  }

  async updateShippingAddress(
    userId: string, 
    addressId: string, 
    updateShippingAddressDto: UpdateShippingAddressDto
  ): Promise<any> {
    // Verify ownership
    const address = await this.prisma.shippingAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    const { isDefault, ...addressData } = updateShippingAddressDto;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.shippingAddress.update({
      where: { id: addressId },
      data: {
        ...addressData,
        ...(isDefault !== undefined && { isDefault }),
      },
    });
  }

  async deleteShippingAddress(userId: string, addressId: string): Promise<any> {
    // Verify ownership
    const address = await this.prisma.shippingAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    await this.prisma.shippingAddress.delete({
      where: { id: addressId },
    });

    return { message: 'Shipping address deleted successfully' };
  }

  async getUserStats(userId: string): Promise<any> {
    const [user, wineStats, orderStats, reviewStats] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          createdAt: true,
          verified: true,
        },
      }),
      this.prisma.wine.groupBy({
        by: ['status'],
        where: { sellerId: userId },
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: {
          OR: [
            { sellerId: userId },
            { buyerId: userId },
          ],
        },
        _count: true,
      }),
      this.prisma.review.aggregate({
        where: { targetId: userId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      memberSince: user.createdAt,
      verified: user.verified,
      wines: wineStats.reduce((acc, stat) => ({ ...acc, [stat.status]: stat._count }), {}),
      orders: orderStats.reduce((acc, stat) => ({ ...acc, [stat.status]: stat._count }), {}),
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count,
    };
  }
}