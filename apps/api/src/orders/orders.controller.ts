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
  OrderFiltersDto 
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