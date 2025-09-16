import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { 
  CreateOrderDto, 
  UpdateOrderStatusDto, 
  ProcessPaymentDto, 
  OrderFiltersDto,
  AddToCartDto,
  UpdateCartItemDto,
  CheckoutCartDto
} from './dto/order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@wine-marketplace/shared';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data or insufficient wine quantity' })
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any): Promise<any> {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders with filters' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  findAll(@Query() filters: OrderFiltersDto, @CurrentUser() user: any): Promise<any> {
    return this.ordersService.findMany(filters, user.id, user.role);
  }

  // Shopping Cart endpoints - MUST be before :id route
  @Get('cart')
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@CurrentUser() user: any): Promise<any> {
    try {
      console.log('🎯 Controller getCart called for user:', user.id);
      console.log('🎯 About to call ordersService.getCart');

      const result = await this.ordersService.getCart(user.id);

      console.log('🎯 Controller received result from service:', result);
      return result;
    } catch (error) {
      console.error('🎯 Controller getCart ERROR:', error);
      console.error('🎯 Error stack:', error.stack);
      throw error;
    }
  }

  @Post('cart/items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Wine not available or insufficient quantity' })
  addToCart(@Body() addToCartDto: AddToCartDto, @CurrentUser() user: any): Promise<any> {
    return this.ordersService.addToCart(user.id, addToCartDto);
  }

  @Patch('cart/items/:wineId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  @ApiResponse({ status: 400, description: 'Insufficient quantity available' })
  updateCartItem(
    @Param('wineId') wineId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.ordersService.updateCartItem(user.id, wineId, updateCartItemDto.quantity);
  }

  @Delete('cart/items/:wineId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  removeFromCart(@Param('wineId') wineId: string, @CurrentUser() user: any): Promise<any> {
    return this.ordersService.removeFromCart(user.id, wineId);
  }

  @Delete('cart')
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  clearCart(@CurrentUser() user: any): Promise<any> {
    return this.ordersService.clearCart(user.id);
  }

  @Post('cart/checkout')
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created from cart successfully' })
  @ApiResponse({ status: 400, description: 'Cart is empty or items unavailable' })
  checkoutCart(@Body() checkoutCartDto: CheckoutCartDto, @CurrentUser() user: any): Promise<any> {
    return this.ordersService.checkoutCart(user.id, checkoutCartDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your order' })
  findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<any> {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (seller or admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only seller or admin can update' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user.id, user.role);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Process payment for order' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment processing failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your order' })
  processPayment(
    @Param('id') id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.ordersService.processPayment(id, processPaymentDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel shipped/delivered orders' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(@Param('id') id: string, @CurrentUser() user: any): Promise<any> {
    return this.ordersService.cancelOrder(id, user.id, user.role);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get orders by user ID (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User orders retrieved successfully' })
  findByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    const filters: OrderFiltersDto = {
      buyerId: userId,
      page,
      limit,
    };
    return this.ordersService.findMany(filters, user.id, user.role);
  }
}