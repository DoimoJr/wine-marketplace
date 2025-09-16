import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { AddToWishlistDto, WishlistFiltersDto } from './dto/wishlist.dto';
import { WineStatus } from '@wine-marketplace/shared';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async addToWishlist(addToWishlistDto: AddToWishlistDto, userId: string): Promise<any> {
    const { wineId } = addToWishlistDto;

    // Check if wine exists and is available
    const wine = await this.prisma.wine.findUnique({
      where: { id: wineId },
      select: {
        id: true,
        title: true,
        status: true,
        sellerId: true,
      },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    if (wine.status !== WineStatus.ACTIVE) {
      throw new BadRequestException('Wine is not available');
    }

    // Users cannot add their own wines to wishlist
    if (wine.sellerId === userId) {
      throw new BadRequestException('You cannot add your own wine to wishlist');
    }

    // Check if already in wishlist
    const existingWishlistItem = await this.prisma.wishlist.findUnique({
      where: {
        userId_wineId: {
          userId,
          wineId,
        },
      },
    });

    if (existingWishlistItem) {
      throw new ConflictException('Wine is already in your wishlist');
    }

    // Add to wishlist
    const wishlistItem = await this.prisma.wishlist.create({
      data: {
        userId,
        wineId,
      },
      include: {
        wine: {
          include: {
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
          },
        },
      },
    });

    return wishlistItem;
  }

  async removeFromWishlist(wineId: string, userId: string): Promise<any> {
    const wishlistItem = await this.prisma.wishlist.findUnique({
      where: {
        userId_wineId: {
          userId,
          wineId,
        },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wine not found in your wishlist');
    }

    await this.prisma.wishlist.delete({
      where: {
        id: wishlistItem.id,
      },
    });

    return { message: 'Wine removed from wishlist successfully' };
  }

  async getWishlist(filters: WishlistFiltersDto, userId: string): Promise<any> {
    const { page = 1, limit = 20 } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const [wishlistItems, total] = await Promise.all([
      this.prisma.wishlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          wine: {
            include: {
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
            },
          },
        },
      }),
      this.prisma.wishlist.count({ where: { userId } }),
    ]);

    return {
      wishlistItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isInWishlist(wineId: string, userId: string): Promise<boolean> {
    const wishlistItem = await this.prisma.wishlist.findUnique({
      where: {
        userId_wineId: {
          userId,
          wineId,
        },
      },
    });

    return !!wishlistItem;
  }

  async getWishlistCount(userId: string): Promise<number> {
    return this.prisma.wishlist.count({
      where: { userId },
    });
  }

  async clearWishlist(userId: string): Promise<any> {
    const deletedCount = await this.prisma.wishlist.deleteMany({
      where: { userId },
    });

    return {
      message: 'Wishlist cleared successfully',
      deletedCount: deletedCount.count,
    };
  }
}