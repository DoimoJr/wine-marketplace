import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  Min, 
  Max, 
  MaxLength,
  IsArray,
  IsUrl
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { WineType, WineCondition, WineStatus } from '@wine-marketplace/shared';

export class CreateWineDto {
  @ApiProperty({
    description: 'Wine title',
    example: 'Barolo DOCG Brunate 2018',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Wine description',
    example: 'Exceptional Barolo from one of the most prestigious crus in the region.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Description cannot be longer than 2000 characters' })
  description: string;

  @ApiProperty({
    description: 'Price in EUR',
    example: 85.50,
    minimum: 0.01,
    maximum: 10000,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with max 2 decimal places' })
  @Min(0.01, { message: 'Price must be at least 0.01 EUR' })
  @Max(10000, { message: 'Price cannot exceed 10000 EUR' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'Annata del vino',
    example: 2018,
    minimum: 1800,
  })
  @IsOptional()
  @IsInt()
  @Min(1800, { message: 'Annata cannot be earlier than 1800' })
  @Max(new Date().getFullYear(), { message: 'Annata cannot be in the future' })
  @Type(() => Number)
  annata?: number;

  @ApiPropertyOptional({
    description: 'Wine region',
    example: 'Piemonte',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({
    description: 'Country of origin',
    example: 'Italy',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Wine producer',
    example: 'Giuseppe Rinaldi',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  producer?: string;

  @ApiPropertyOptional({
    description: 'Grape variety',
    example: 'Nebbiolo',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  grapeVariety?: string;

  @ApiPropertyOptional({
    description: 'Alcohol content percentage',
    example: 14.5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(50)
  @Type(() => Number)
  alcoholContent?: number;

  @ApiPropertyOptional({
    description: 'Bottle volume in ml',
    example: 750,
    minimum: 1,
    maximum: 5000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5000)
  @Type(() => Number)
  volume?: number;

  @ApiProperty({
    description: 'Type of wine',
    enum: WineType,
    example: WineType.RED,
  })
  @IsEnum(WineType, { message: 'Wine type must be one of: RED, WHITE, ROSE, SPARKLING, DESSERT, FORTIFIED, OTHER' })
  wineType: WineType;

  @ApiProperty({
    description: 'Condition of the wine',
    enum: WineCondition,
    example: WineCondition.EXCELLENT,
  })
  @IsEnum(WineCondition, { message: 'Wine condition must be one of: MINT, EXCELLENT, VERY_GOOD, GOOD, FAIR, POOR' })
  condition: WineCondition;

  @ApiProperty({
    description: 'Quantity available',
    example: 1,
    minimum: 1,
    maximum: 999,
  })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(999, { message: 'Quantity cannot exceed 999' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Array of image URLs',
    example: ['/images/wine1.jpg', '/images/wine2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class UpdateWineDto extends PartialType(CreateWineDto) {
  @ApiPropertyOptional({
    description: 'Wine status',
    enum: WineStatus,
    example: WineStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(WineStatus)
  status?: WineStatus;
}

export class WineFiltersDto {
  @ApiPropertyOptional({
    description: 'Search query',
    example: 'Barolo',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Wine types to filter by',
    enum: WineType,
    isArray: true,
    example: [WineType.RED, WineType.WHITE],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsEnum(WineType, { each: true })
  wineType?: WineType[];

  @ApiPropertyOptional({
    description: 'Countries to filter by',
    example: ['Italy', 'France'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  country?: string[];

  @ApiPropertyOptional({
    description: 'Regions to filter by',
    example: ['Piemonte', 'Toscana'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  region?: string[];

  @ApiPropertyOptional({
    description: 'Producers to filter by',
    example: ['Giuseppe Rinaldi', 'Antinori'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  producer?: string[];

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceMax?: number;

  @ApiPropertyOptional({
    description: 'Annata minima',
    example: 2000,
    minimum: 1800,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Type(() => Number)
  annataMin?: number;

  @ApiPropertyOptional({
    description: 'Annata massima',
    example: 2020,
    minimum: 1800,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Type(() => Number)
  annataMax?: number;

  @ApiPropertyOptional({
    description: 'Wine conditions to filter by',
    enum: WineCondition,
    isArray: true,
    example: [WineCondition.EXCELLENT, WineCondition.MINT],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsEnum(WineCondition, { each: true })
  condition?: WineCondition[];

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'price',
    enum: ['createdAt', 'price', 'annata', 'title'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'price' | 'annata' | 'title';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

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