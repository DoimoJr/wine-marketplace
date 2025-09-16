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

export class AddFavoriteSellerDto {
  @ApiProperty({
    description: 'Seller ID to add to favorites',
    example: 'cmflh8rag00079y5nf6wtsxec',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^c[0-9a-z]{24}$/, {
    message: 'sellerId must be a valid CUID',
  })
  sellerId: string;
}

export class FavoriteSellersFiltersDto {
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

export class FavoriteSellerResponseDto {
  @ApiProperty({
    description: 'Favorite seller item ID',
    example: 'clxxx-favorite-seller-id-xxxx',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'clxxx-user-id-xxxx',
  })
  userId: string;

  @ApiProperty({
    description: 'Seller ID',
    example: 'clxxx-seller-id-xxxx',
  })
  sellerId: string;

  @ApiProperty({
    description: 'When the seller was added to favorites',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Seller details (when included)',
  })
  seller?: any;
}