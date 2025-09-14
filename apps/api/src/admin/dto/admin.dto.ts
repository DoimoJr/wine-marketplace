import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean,
  IsNumber,
  IsDateString,
  IsInt,
  IsArray,
  Min,
  Max,
  IsUUID,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  RefundReason, 
  RefundStatus, 
  AdminAction, 
  UserRole,
  WineStatus,
  WineType,
  WineCondition,
  OrderStatus,
  PaymentStatus 
} from '@wine-marketplace/shared';

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Refund status decision',
    enum: RefundStatus,
    example: RefundStatus.APPROVED,
  })
  @IsEnum(RefundStatus)
  status: RefundStatus;

  @ApiPropertyOptional({
    description: 'Admin notes about the refund decision',
    example: 'Approved due to damaged item during shipping',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}

export class CreateRefundRequestDto {
  @ApiProperty({
    description: 'Order ID for refund',
    example: 'clxxx-order-id-xxxx',
  })
  @IsString()
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Reason for refund',
    enum: RefundReason,
    example: RefundReason.DAMAGED_ITEM,
  })
  @IsEnum(RefundReason)
  reason: RefundReason;

  @ApiPropertyOptional({
    description: 'Detailed explanation of the refund request',
    example: 'The wine bottle arrived with a cracked cork and some wine had leaked',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @ApiProperty({
    description: 'Refund amount requested',
    example: 85.50,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;
}

export class UpdateUserStatusDto {
  @ApiPropertyOptional({
    description: 'Ban or unban user',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  banned?: boolean;

  @ApiPropertyOptional({
    description: 'Verify or unverify user',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Change user role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Admin notes about the status change',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}

export class UpdateWineStatusDto {
  @ApiProperty({
    description: 'Wine status',
    enum: WineStatus,
    example: WineStatus.ACTIVE,
  })
  @IsEnum(WineStatus)
  status: WineStatus;

  @ApiPropertyOptional({
    description: 'Admin notes about the wine status change',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}

export class AdminFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by admin action',
    enum: AdminAction,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(AdminAction, { each: true })
  action?: AdminAction[];

  @ApiPropertyOptional({
    description: 'Filter by admin ID',
    example: 'clxxx-admin-id-xxxx',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  adminId?: string;

  @ApiPropertyOptional({
    description: 'Filter by target type',
    example: 'user',
  })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({
    description: 'Start date filter',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
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
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class RefundFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by refund status (single value or array)',
    enum: RefundStatus,
    type: 'string',
  })
  @IsOptional()
  status?: RefundStatus | RefundStatus[];

  @ApiPropertyOptional({
    description: 'Filter by refund reason',
    enum: RefundReason,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(RefundReason, { each: true })
  reason?: RefundReason[];

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'clxxx-user-id-xxxx',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Start date filter',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
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
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class AdminDashboardStatsDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 1250,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Total number of wines listed',
    example: 3420,
  })
  totalWines: number;

  @ApiProperty({
    description: 'Total number of orders',
    example: 890,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Total revenue generated',
    example: 45230.50,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Number of pending refunds',
    example: 12,
  })
  pendingRefunds: number;

  @ApiProperty({
    description: 'Number of active disputes',
    example: 3,
  })
  activeDisputes: number;

  @ApiProperty({
    description: 'New user signups this month',
    example: 85,
  })
  recentSignups: number;

  @ApiProperty({
    description: 'Sales completed this month',
    example: 156,
  })
  recentSales: number;

  @ApiProperty({
    description: 'Wines pending approval',
    example: 23,
  })
  pendingWines: number;

  @ApiProperty({
    description: 'Active users in the last 30 days',
    example: 432,
  })
  activeUsers: number;
}

export class AdminUpdateWineDto {
  @ApiPropertyOptional({
    description: 'Wine title',
    example: 'Barolo DOCG Brunate 2018',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Wine description',
    example: 'Exceptional Barolo from one of the most prestigious crus in the region.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Price in EUR',
    example: 85.50,
    minimum: 0.01,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(10000)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'Annata del vino',
    example: 2018,
    minimum: 1800,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
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

  @ApiPropertyOptional({
    description: 'Type of wine',
    enum: WineType,
    example: WineType.RED,
  })
  @IsOptional()
  @IsEnum(WineType)
  wineType?: WineType;

  @ApiPropertyOptional({
    description: 'Condition of the wine',
    enum: WineCondition,
    example: WineCondition.EXCELLENT,
  })
  @IsOptional()
  @IsEnum(WineCondition)
  condition?: WineCondition;

  @ApiPropertyOptional({
    description: 'Quantity available',
    example: 1,
    minimum: 1,
    maximum: 999,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: ['/images/wine1.jpg', '/images/wine2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Wine status',
    enum: WineStatus,
    example: WineStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(WineStatus)
  status?: WineStatus;

  @ApiPropertyOptional({
    description: 'Admin notes about the wine changes',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}

export class AdminUpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.SHIPPED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Tracking number for shipment',
    example: 'TN123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery date',
    example: '2024-12-25T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @ApiPropertyOptional({
    description: 'Actual delivery date',
    example: '2024-12-24T14:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @ApiPropertyOptional({
    description: 'Admin notes about the order changes',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}

export class AdminUpdateOrderStatusDto {
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.SHIPPED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Tracking number for shipment',
    example: 'TN123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Admin notes about the status change',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}

export class ProcessOrderRefundDto {
  @ApiProperty({
    description: 'Refund amount',
    example: 85.50,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Customer requested refund due to damaged item',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({
    description: 'Admin notes about the refund',
    example: 'Approved due to shipping damage',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}