import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Patch,
  Param, 
  Body,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiResponse 
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { 
  UpdateProfileDto, 
  CreateShippingAddressDto, 
  UpdateShippingAddressDto,
  ChangePasswordDto,
  UserProfileResponseDto 
} from './dto/user.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id/profile')
  @ApiOperation({ summary: 'Get public user profile by ID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPublicProfile(@Param('id') id: string): Promise<any> {
    return this.usersService.getPublicProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile retrieved successfully' })
  async getCurrentUser(@CurrentUser() user: any): Promise<any> {
    return this.usersService.findById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password or password requirements not met' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    return this.usersService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStats(@CurrentUser() user: any): Promise<any> {
    return this.usersService.getUserStats(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/shipping-addresses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user shipping addresses' })
  @ApiResponse({ status: 200, description: 'Shipping addresses retrieved successfully' })
  async getShippingAddresses(@CurrentUser() user: any): Promise<any> {
    return this.usersService.getShippingAddresses(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/shipping-addresses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new shipping address' })
  @ApiResponse({ status: 201, description: 'Shipping address created successfully' })
  async createShippingAddress(
    @CurrentUser() user: any,
    @Body() createShippingAddressDto: CreateShippingAddressDto,
  ): Promise<any> {
    return this.usersService.createShippingAddress(user.id, createShippingAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/shipping-addresses/:addressId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipping address' })
  @ApiResponse({ status: 200, description: 'Shipping address updated successfully' })
  @ApiResponse({ status: 404, description: 'Shipping address not found' })
  async updateShippingAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
    @Body() updateShippingAddressDto: UpdateShippingAddressDto,
  ): Promise<any> {
    return this.usersService.updateShippingAddress(user.id, addressId, updateShippingAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/shipping-addresses/:addressId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete shipping address' })
  @ApiResponse({ status: 200, description: 'Shipping address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shipping address not found' })
  async deleteShippingAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
  ): Promise<any> {
    return this.usersService.deleteShippingAddress(user.id, addressId);
  }
}