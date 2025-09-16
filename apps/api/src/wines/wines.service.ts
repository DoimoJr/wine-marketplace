import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateWineDto, UpdateWineDto, WineFiltersDto } from './dto/wine.dto';
import { WineStatus, WineType, WineCondition } from '@wine-marketplace/shared';

@Injectable()
export class WinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWineDto: CreateWineDto, sellerId: string): Promise<any> {
    const wine = await this.prisma.wine.create({
      data: {
        ...createWineDto,
        sellerId,
        status: WineStatus.ACTIVE,
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
            createdAt: true,
          },
        },
      },
    });

    return wine;
  }

  async findMany(filters: WineFiltersDto = {}): Promise<any> {
    const {
      search,
      wineType,
      country,
      region,
      producer,
      priceMin,
      priceMax,
      annataMin,
      annataMax,
      condition,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: any = {
      status: WineStatus.ACTIVE,
    };

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { producer: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { grapeVariety: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (wineType && wineType.length > 0) {
      where.wineType = { in: wineType };
    }

    if (country && country.length > 0) {
      where.country = { in: country };
    }

    if (region && region.length > 0) {
      where.region = { in: region };
    }

    if (producer && producer.length > 0) {
      where.producer = { in: producer };
    }

    if (condition && condition.length > 0) {
      where.condition = { in: condition };
    }

    // Price range
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    // Annata range
    if (annataMin !== undefined || annataMax !== undefined) {
      where.annata = {};
      if (annataMin !== undefined) where.annata.gte = annataMin;
      if (annataMax !== undefined) where.annata.lte = annataMax;
    }

    // Sorting
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel
    const [wines, total] = await Promise.all([
      this.prisma.wine.findMany({
        where,
        orderBy,
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
              createdAt: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      this.prisma.wine.count({ where }),
    ]);

    // Calculate average ratings for all wines
    const winesWithRatings = await Promise.all(
      wines.map(async (wine) => {
        const avgRating = await this.prisma.review.aggregate({
          where: { wineId: wine.id },
          _avg: { rating: true },
        });

        return {
          ...wine,
          averageRating: avgRating._avg.rating || 0,
          totalReviews: wine._count.reviews,
        };
      })
    );

    // Get filter options for the frontend
    const filterOptions = await this.getFilterOptions();

    return {
      wines: winesWithRatings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: filterOptions,
    };
  }

  async findOne(id: string): Promise<any> {
    const wine = await this.prisma.wine.findUnique({
      where: { id },
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
          },
        },
        reviews: {
          include: {
            reviewer: {
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
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    // Calculate average rating
    const avgRating = await this.prisma.review.aggregate({
      where: { wineId: id },
      _avg: { rating: true },
    });

    return {
      ...wine,
      averageRating: avgRating._avg.rating || 0,
      totalReviews: wine._count.reviews,
    };
  }

  async update(id: string, updateWineDto: UpdateWineDto, userId: string): Promise<any> {
    const wine = await this.prisma.wine.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    if (wine.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own wines');
    }

    return this.prisma.wine.update({
      where: { id },
      data: updateWineDto,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<any> {
    const wine = await this.prisma.wine.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!wine) {
      throw new NotFoundException('Wine not found');
    }

    if (wine.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own wines');
    }

    // Instead of deleting, mark as inactive
    return this.prisma.wine.update({
      where: { id },
      data: { status: WineStatus.INACTIVE },
    });
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const [wines, total] = await Promise.all([
      this.prisma.wine.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      this.prisma.wine.count({
        where: { sellerId: userId },
      }),
    ]);

    return {
      wines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async getFilterOptions(): Promise<any> {
    // Get unique values for filter options
    const [countries, regions, producers] = await Promise.all([
      this.prisma.wine.findMany({
        where: { 
          status: WineStatus.ACTIVE,
          country: { not: null },
        },
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' },
      }),
      this.prisma.wine.findMany({
        where: { 
          status: WineStatus.ACTIVE,
          region: { not: null },
        },
        select: { region: true },
        distinct: ['region'],
        orderBy: { region: 'asc' },
      }),
      this.prisma.wine.findMany({
        where: { 
          status: WineStatus.ACTIVE,
          producer: { not: null },
        },
        select: { producer: true },
        distinct: ['producer'],
        orderBy: { producer: 'asc' },
      }),
    ]);

    // Get price and annata ranges
    const priceRange = await this.prisma.wine.aggregate({
      where: { status: WineStatus.ACTIVE },
      _min: { price: true },
      _max: { price: true },
    });

    const annataRange = await this.prisma.wine.aggregate({
      where: { 
        status: WineStatus.ACTIVE,
        annata: { not: null },
      },
      _min: { annata: true },
      _max: { annata: true },
    });

    return {
      countries: countries.map(c => c.country).filter(Boolean),
      regions: regions.map(r => r.region).filter(Boolean),
      producers: producers.map(p => p.producer).filter(Boolean),
      wineTypes: Object.values(WineType),
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 1000,
      },
      annataRange: {
        min: annataRange._min.annata || 1800,
        max: annataRange._max.annata || new Date().getFullYear(),
      },
    };
  }
}