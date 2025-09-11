import { 
  IsString, 
  IsOptional, 
  MaxLength, 
  IsEmail, 
  IsPhoneNumber,
  IsBoolean,
  Matches,
  MinLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'First name',
    example: 'Marco',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Rossi',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User bio/description',
    example: 'Wine collector from Tuscany with 20+ years of experience',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio cannot be longer than 500 characters' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'Firenze, Italy',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Location cannot be longer than 100 characters' })
  location?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+39 333 1234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateShippingAddressDto {
  @ApiProperty({
    description: 'First name',
    example: 'Marco',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Rossi',
  })
  @IsString()
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
  zipCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'Italy',
  })
  @IsString()
  country: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+39 06 1234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Set as default address',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateShippingAddressDto {
  @ApiPropertyOptional({
    description: 'First name',
    example: 'Marco',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Rossi',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Wine Imports SRL',
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    description: 'Primary address line',
    example: 'Via Roma 123',
  })
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiPropertyOptional({
    description: 'Secondary address line',
    example: 'Apt 4B',
  })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Roma',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'State/Province',
    example: 'Lazio',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'ZIP/Postal code',
    example: '00100',
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Italy',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+39 06 1234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Set as default address',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPassword123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clxxx-user-id-xxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'wineuser123',
  })
  username: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'Marco',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Rossi',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Wine collector from Tuscany',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'Firenze, Italy',
  })
  location?: string;

  @ApiProperty({
    description: 'Is user verified',
    example: true,
  })
  verified: boolean;

  @ApiProperty({
    description: 'Member since date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Total wines sold',
    example: 15,
  })
  totalSales: number;

  @ApiProperty({
    description: 'Total wines purchased',
    example: 8,
  })
  totalPurchases: number;

  @ApiProperty({
    description: 'Average rating from reviews',
    example: 4.8,
  })
  averageRating: number;

  @ApiProperty({
    description: 'Total number of reviews received',
    example: 23,
  })
  totalReviews: number;
}