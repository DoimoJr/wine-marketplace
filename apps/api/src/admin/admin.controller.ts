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
  AdminFiltersDto,
  RefundFiltersDto,
  AdminDashboardStatsDto,
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
  @ApiResponse({ status: 200, description: 'Wines retrieved successfully' })
  getWines(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: WineStatus,
  ): Promise<any> {
    const pageNumber = page && !isNaN(parseInt(page, 10)) ? parseInt(page, 10) : 1;
    const limitNumber = limit && !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : 20;
    return this.adminService.getWines(pageNumber, limitNumber, status);
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
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ): Promise<any> {
    const pageNumber = page && !isNaN(parseInt(page, 10)) ? parseInt(page, 10) : 1;
    const limitNumber = limit && !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : 20;
    return this.adminService.getOrders(pageNumber, limitNumber, status);
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
}