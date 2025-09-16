import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsUUID,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentProvider, PaymentStatus } from '@wine-marketplace/shared';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Wine ID',
    example: 'clxxx-wine-id-xxxx',
  })
  @IsString()
  @IsNotEmpty()
  wineId: string;

  @ApiProperty({
    description: 'Quantity to order',
    example: 2,
    minimum: 1,
    maximum: 999,
  })
  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;
}

export class CreateShippingAddressDto {
  @ApiProperty({
    description: 'First name',
    example: 'Marco',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Rossi',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Wine Imports SRL',
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({
    description: 'Primary address line',
    example: 'Via Roma 123',
  })
  @IsString()
  @IsNotEmpty()
  address1: string;

  @ApiPropertyOptional({
    description: 'Secondary address line',
    example: 'Apt 4B',
  })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiProperty({
    description: 'City',
    example: 'Roma',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({
    description: 'State/Province',
    example: 'Lazio',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'ZIP/Postal code',
    example: '00100',
  })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'Italy',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+39 06 1234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of items to order',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    description: 'Existing shipping address ID',
    example: 'clxxx-address-id-xxxx',
  })
  @IsOptional()
  @IsString()
  shippingAddressId?: string;

  @ApiPropertyOptional({
    description: 'New shipping address (if not using existing)',
    type: CreateShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateShippingAddressDto)
  shippingAddress?: CreateShippingAddressDto;

  @ApiPropertyOptional({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.PAYPAL,
  })
  @IsOptional()
  @IsEnum(PaymentProvider)
  paymentProvider?: PaymentProvider;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.SHIPPED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Tracking number for shipped orders',
    example: 'TN123456789IT',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery date',
    example: '2024-01-20T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @ApiPropertyOptional({
    description: 'Shipping label URL',
    example: 'https://labels.example.com/label123.pdf',
  })
  @IsOptional()
  @IsString()
  shippingLabelUrl?: string;
}

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.PAYPAL,
  })
  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @ApiProperty({
    description: 'Payment ID from provider',
    example: 'PAYID-12345-67890',
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiPropertyOptional({
    description: 'Additional payment data',
    example: { payerId: 'PAYER123' },
  })
  @IsOptional()
  paymentData?: any;
}

export class OrderFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus[];

  @ApiPropertyOptional({
    description: 'Filter by payment status',
    enum: PaymentStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PaymentStatus, { each: true })
  paymentStatus?: PaymentStatus[];

  @ApiPropertyOptional({
    description: 'Filter by seller ID',
    example: 'clxxx-user-id-xxxx',
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by buyer ID',
    example: 'clxxx-user-id-xxxx',
  })
  @IsOptional()
  @IsString()
  buyerId?: string;

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

// Cart DTOs
export class AddToCartDto extends CreateOrderItemDto {}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity for the cart item',
    example: 3,
    minimum: 1,
    maximum: 999,
  })
  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;
}

export class CheckoutCartDto {
  @ApiPropertyOptional({
    description: 'Existing shipping address ID',
    example: 'clxxx-address-id-xxxx',
  })
  @IsOptional()
  @IsString()
  shippingAddressId?: string;

  @ApiPropertyOptional({
    description: 'New shipping address (if not using existing)',
    type: CreateShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateShippingAddressDto)
  shippingAddress?: CreateShippingAddressDto;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.PAYPAL,
  })
  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;
}