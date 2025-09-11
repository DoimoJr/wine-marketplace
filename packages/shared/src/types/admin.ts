import { RefundReason, RefundStatus, AdminAction } from './enums';
import { User } from './user';
import { Order } from './order';

export interface RefundRequest {
  id: string;
  reason: RefundReason;
  details?: string;
  amount: number;
  status: RefundStatus;
  adminNotes?: string;
  processedAt?: Date;
  order: Order;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLog {
  id: string;
  action: AdminAction;
  details?: string;
  targetType?: string;
  targetId?: string;
  admin: User;
  createdAt: Date;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalWines: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRefunds: number;
  activeDisputes: number;
  recentSignups: number;
  recentSales: number;
}

export interface CreateRefundRequest {
  orderId: string;
  reason: RefundReason;
  details?: string;
  amount: number;
}

export interface ProcessRefundRequest {
  status: RefundStatus;
  adminNotes?: string;
}

