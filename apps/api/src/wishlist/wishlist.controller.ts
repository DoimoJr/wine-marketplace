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
import { WishlistService } from './wishlist.service';
import { 
  AddToWishlistDto, 
  WishlistFiltersDto,
  WishlistResponseDto 
} from './dto/wishlist.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add wine to wishlist' })
  @ApiResponse({ 
    status: 201, 
    description: 'Wine added to wishlist successfully',
    type: WishlistResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Wine not available or already in wishlist' })
  @ApiResponse({ status: 404, description: 'Wine not found' })
  @ApiResponse({ status: 409, description: 'Wine already in wishlist' })
  addToWishlist(
    @Body() addToWishlistDto: AddToWishlistDto, 
    @CurrentUser() user: any
  ): Promise<any> {
    return this.wishlistService.addToWishlist(addToWishlistDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wishlist retrieved successfully' 
  })
  getWishlist(
    @Query() filters: WishlistFiltersDto, 
    @CurrentUser() user: any
  ): Promise<any> {
    return this.wishlistService.getWishlist(filters, user.id);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get wishlist items count' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wishlist count retrieved successfully' 
  })
  getWishlistCount(@CurrentUser() user: any): Promise<number> {
    return this.wishlistService.getWishlistCount(user.id);
  }

  @Get('check/:wineId')
  @ApiOperation({ summary: 'Check if wine is in wishlist' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wishlist status checked successfully' 
  })
  isInWishlist(
    @Param('wineId') wineId: string, 
    @CurrentUser() user: any
  ): Promise<{ isInWishlist: boolean }> {
    return this.wishlistService.isInWishlist(wineId, user.id)
      .then(isInWishlist => ({ isInWishlist }));
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire wishlist' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wishlist cleared successfully' 
  })
  clearWishlist(@CurrentUser() user: any): Promise<any> {
    return this.wishlistService.clearWishlist(user.id);
  }

  @Delete(':wineId')
  @ApiOperation({ summary: 'Remove wine from wishlist' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wine removed from wishlist successfully' 
  })
  @ApiResponse({ status: 404, description: 'Wine not found in wishlist' })
  removeFromWishlist(
    @Param('wineId') wineId: string, 
    @CurrentUser() user: any
  ): Promise<any> {
    return this.wishlistService.removeFromWishlist(wineId, user.id);
  }
}