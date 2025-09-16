import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'Wine ID to add to wishlist',
    example: 'cmflh8rag00079y5nf6wtsxec',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^c[0-9a-z]{24}$/, {
    message: 'wineId must be a valid CUID',
  })
  wineId: string;
}

export class WishlistFiltersDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class WishlistResponseDto {
  @ApiProperty({
    description: 'Wishlist item ID',
    example: 'clxxx-wishlist-id-xxxx',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'clxxx-user-id-xxxx',
  })
  userId: string;

  @ApiProperty({
    description: 'Wine ID',
    example: 'clxxx-wine-id-xxxx',
  })
  wineId: string;

  @ApiProperty({
    description: 'When the item was added to wishlist',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Wine details (when included)',
  })
  wine?: any;
}