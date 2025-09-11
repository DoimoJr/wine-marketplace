import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean,
  IsNumber,
  IsDateString,
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
  OrderStatus 
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
    description: 'Filter by refund status',
    enum: RefundStatus,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(RefundStatus, { each: true })
  status?: RefundStatus[];

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