import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FavoriteSellersService } from './favorite-sellers.service';
import {
  AddFavoriteSellerDto,
  FavoriteSellersFiltersDto,
  FavoriteSellerResponseDto
} from './dto/favorite-sellers.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Favorite Sellers')
@Controller('favorite-sellers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteSellersController {
  constructor(private readonly favoriteSellersService: FavoriteSellersService) {}

  @Post()
  @ApiOperation({ summary: 'Add seller to favorites' })
  @ApiResponse({
    status: 201,
    description: 'Seller added to favorites successfully',
    type: FavoriteSellerResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - Seller is banned or trying to add yourself' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  @ApiResponse({ status: 409, description: 'Seller already in favorites' })
  addFavoriteSeller(
    @Body() addFavoriteSellerDto: AddFavoriteSellerDto,
    @CurrentUser() user: any
  ): Promise<any> {
    return this.favoriteSellersService.addFavoriteSeller(addFavoriteSellerDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorite sellers' })
  @ApiResponse({
    status: 200,
    description: 'Favorite sellers retrieved successfully'
  })
  getFavoriteSellers(
    @Query() filters: FavoriteSellersFiltersDto,
    @CurrentUser() user: any
  ): Promise<any> {
    return this.favoriteSellersService.getFavoriteSellers(filters, user.id);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get favorite sellers count' })
  @ApiResponse({
    status: 200,
    description: 'Favorite sellers count retrieved successfully'
  })
  getFavoriteSellersCount(@CurrentUser() user: any): Promise<number> {
    return this.favoriteSellersService.getFavoriteSellersCount(user.id);
  }

  @Get('check/:sellerId')
  @ApiOperation({ summary: 'Check if seller is in favorites' })
  @ApiResponse({
    status: 200,
    description: 'Favorite status checked successfully'
  })
  isFavoriteSeller(
    @Param('sellerId') sellerId: string,
    @CurrentUser() user: any
  ): Promise<{ isFavorite: boolean }> {
    return this.favoriteSellersService.isFavoriteSeller(sellerId, user.id)
      .then(isFavorite => ({ isFavorite }));
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all favorite sellers' })
  @ApiResponse({
    status: 200,
    description: 'Favorite sellers cleared successfully'
  })
  clearFavoriteSellers(@CurrentUser() user: any): Promise<any> {
    return this.favoriteSellersService.clearFavoriteSellers(user.id);
  }

  @Delete(':sellerId')
  @ApiOperation({ summary: 'Remove seller from favorites' })
  @ApiResponse({
    status: 200,
    description: 'Seller removed from favorites successfully'
  })
  @ApiResponse({ status: 404, description: 'Seller not found in favorites' })
  removeFavoriteSeller(
    @Param('sellerId') sellerId: string,
    @CurrentUser() user: any
  ): Promise<any> {
    return this.favoriteSellersService.removeFavoriteSeller(sellerId, user.id);
  }
}