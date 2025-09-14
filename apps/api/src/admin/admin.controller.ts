import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
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
import { AdminService } from './admin.service';
import {
  ProcessRefundDto,
  CreateRefundRequestDto,
  UpdateUserStatusDto,
  UpdateWineStatusDto,
  AdminUpdateWineDto,
  AdminUpdateOrderDto,
  AdminUpdateOrderStatusDto,
  AdminFiltersDto,
  RefundFiltersDto,
  AdminDashboardStatsDto,
  ProcessOrderRefundDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, WineStatus, OrderStatus } from '@wine-marketplace/shared';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully', type: AdminDashboardStatsDto })
  getDashboardStats(): Promise<any> {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    const pageNumber = page && !isNaN(parseInt(page, 10)) ? parseInt(page, 10) : 1;
    const limitNumber = limit && !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : 20;
    return this.adminService.getUsers(pageNumber, limitNumber, search);
  }

  @Put('users/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user (ban, verify, role, notes)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.updateUser(userId, updateUserStatusDto, admin.id);
  }

  @Patch('users/:userId/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user status (ban, verify, role)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserStatus(
    @Param('userId') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.updateUserStatus(userId, updateUserStatusDto, admin.id);
  }

  @Get('wines')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all wines (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: WineStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Wines retrieved successfully' })
  getWines(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: WineStatus,
    @Query('search') search?: string,
  ): Promise<any> {
    const pageNumber = page && !isNaN(parseInt(page, 10)) ? parseInt(page, 10) : 1;
    const limitNumber = limit && !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : 20;
    return this.adminService.getWines(pageNumber, limitNumber, status, search);
  }

  @Put('wines/:wineId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update wine details (admin only)' })
  @ApiResponse({ status: 200, description: 'Wine updated successfully' })
  @ApiResponse({ status: 404, description: 'Wine not found' })
  updateWine(
    @Param('wineId') wineId: string,
    @Body() updateWineDto: AdminUpdateWineDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.updateWine(wineId, updateWineDto, admin.id);
  }

  @Patch('wines/:wineId/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update wine status (approve/reject)' })
  @ApiResponse({ status: 200, description: 'Wine status updated successfully' })
  @ApiResponse({ status: 404, description: 'Wine not found' })
  updateWineStatus(
    @Param('wineId') wineId: string,
    @Body() updateWineStatusDto: UpdateWineStatusDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.updateWineStatus(wineId, updateWineStatusDto, admin.id);
  }

  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ): Promise<any> {
    const pageNumber = page && !isNaN(parseInt(page, 10)) ? parseInt(page, 10) : 1;
    const limitNumber = limit && !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : 20;
    return this.adminService.getOrders(pageNumber, limitNumber, status, search);
  }

  @Get('orders/stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get order status counts' })
  @ApiResponse({ status: 200, description: 'Order status counts retrieved successfully' })
  getOrderStatusCounts(): Promise<any> {
    return this.adminService.getOrderStatusCounts();
  }

  @Get('orders/:orderId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get single order details (admin only)' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  getOrder(@Param('orderId') orderId: string): Promise<any> {
    return this.adminService.getOrder(orderId);
  }

  @Put('orders/:orderId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update order details (admin only)' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateOrder(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: AdminUpdateOrderDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.updateOrder(orderId, updateOrderDto, admin.id);
  }

  @Patch('orders/:orderId/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateOrderStatusDto: AdminUpdateOrderStatusDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.updateOrderStatus(orderId, updateOrderStatusDto, admin.id);
  }

  @Get('refunds')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get refund requests' })
  @ApiResponse({ status: 200, description: 'Refund requests retrieved successfully' })
  getRefunds(@Query() filters: RefundFiltersDto): Promise<any> {
    return this.adminService.getRefunds(filters);
  }

  @Post('refunds')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create refund request (user)' })
  @ApiResponse({ status: 201, description: 'Refund request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund request data' })
  createRefundRequest(
    @Body() createRefundRequestDto: CreateRefundRequestDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.adminService.createRefundRequest(createRefundRequestDto, user.id);
  }

  @Patch('refunds/:refundId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Process refund request (approve/deny)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Refund already processed' })
  @ApiResponse({ status: 404, description: 'Refund request not found' })
  processRefund(
    @Param('refundId') refundId: string,
    @Body() processRefundDto: ProcessRefundDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.processRefund(refundId, processRefundDto, admin.id);
  }

  @Get('logs')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin action logs' })
  @ApiResponse({ status: 200, description: 'Admin logs retrieved successfully' })
  getAdminLogs(@Query() filters: AdminFiltersDto): Promise<any> {
    return this.adminService.getAdminLogs(filters);
  }

  @Get('refunds/stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get refund status counts' })
  @ApiResponse({ status: 200, description: 'Refund status counts retrieved successfully' })
  getRefundStatusCounts(): Promise<any> {
    return this.adminService.getRefundStatusCounts();
  }

  @Post('orders/:orderId/refund')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Process refund for an order (admin only)' })
  @ApiResponse({ status: 201, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund data' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  processOrderRefund(
    @Param('orderId') orderId: string,
    @Body() processOrderRefundDto: ProcessOrderRefundDto,
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.processOrderRefund(orderId, processOrderRefundDto, admin.id);
  }

  @Post('users/bulk-ban')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ban multiple users' })
  @ApiResponse({ status: 200, description: 'Users banned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  bulkBanUsers(
    @Body() body: { userIds: string[] },
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.bulkBanUsers(body.userIds, admin.id);
  }

  @Post('users/bulk-verify')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verify multiple users' })
  @ApiResponse({ status: 200, description: 'Users verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  bulkVerifyUsers(
    @Body() body: { userIds: string[] },
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.bulkVerifyUsers(body.userIds, admin.id);
  }

  @Post('users/bulk-unverify')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Unverify multiple users' })
  @ApiResponse({ status: 200, description: 'Users unverified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  bulkUnverifyUsers(
    @Body() body: { userIds: string[] },
    @CurrentUser() admin: any,
  ): Promise<any> {
    return this.adminService.bulkUnverifyUsers(body.userIds, admin.id);
  }
}