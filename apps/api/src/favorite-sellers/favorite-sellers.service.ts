import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { AddFavoriteSellerDto, FavoriteSellersFiltersDto } from './dto/favorite-sellers.dto';

@Injectable()
export class FavoriteSellersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async addFavoriteSeller(addFavoriteSellerDto: AddFavoriteSellerDto, userId: string): Promise<any> {
    const { sellerId } = addFavoriteSellerDto;

    // Check if seller exists and is active
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verified: true,
        banned: true,
        _count: {
          select: {
            wines: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    if (seller.banned) {
      throw new BadRequestException('Seller is banned');
    }

    // Users cannot add themselves as favorite seller
    if (sellerId === userId) {
      throw new BadRequestException('You cannot add yourself as favorite seller');
    }

    // Check if already in favorites
    const existingFavorite = await this.prisma.favoriteSeller.findUnique({
      where: {
        userId_sellerId: {
          userId,
          sellerId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Seller is already in your favorites');
    }

    // Add to favorites
    const favoriteItem = await this.prisma.favoriteSeller.create({
      data: {
        userId,
        sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            bio: true,
            location: true,
            createdAt: true,
            _count: {
              select: {
                wines: {
                  where: {
                    status: 'ACTIVE'
                  }
                },
                reviews: true
              }
            }
          },
        },
      },
    });

    return favoriteItem;
  }

  async removeFavoriteSeller(sellerId: string, userId: string): Promise<any> {
    const favoriteItem = await this.prisma.favoriteSeller.findUnique({
      where: {
        userId_sellerId: {
          userId,
          sellerId,
        },
      },
    });

    if (!favoriteItem) {
      throw new NotFoundException('Seller not found in your favorites');
    }

    await this.prisma.favoriteSeller.delete({
      where: {
        id: favoriteItem.id,
      },
    });

    return { message: 'Seller removed from favorites successfully' };
  }

  async getFavoriteSellers(filters: FavoriteSellersFiltersDto, userId: string): Promise<any> {
    const { page = 1, limit = 20 } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const [favoriteItems, total] = await Promise.all([
      this.prisma.favoriteSeller.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              verified: true,
              bio: true,
              location: true,
              createdAt: true,
              _count: {
                select: {
                  wines: {
                    where: {
                      status: 'ACTIVE'
                    }
                  },
                  reviews: true
                }
              }
            },
          },
        },
      }),
      this.prisma.favoriteSeller.count({ where: { userId } }),
    ]);

    return {
      favoriteItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isFavoriteSeller(sellerId: string, userId: string): Promise<boolean> {
    const favoriteItem = await this.prisma.favoriteSeller.findUnique({
      where: {
        userId_sellerId: {
          userId,
          sellerId,
        },
      },
    });

    return !!favoriteItem;
  }

  async getFavoriteSellersCount(userId: string): Promise<number> {
    return this.prisma.favoriteSeller.count({
      where: { userId },
    });
  }

  async clearFavoriteSellers(userId: string): Promise<any> {
    const deletedCount = await this.prisma.favoriteSeller.deleteMany({
      where: { userId },
    });

    return {
      message: 'Favorite sellers cleared successfully',
      deletedCount: deletedCount.count,
    };
  }
}