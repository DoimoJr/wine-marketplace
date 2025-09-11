import { OrderStatus, PaymentProvider, PaymentStatus } from './enums';
import { User } from './user';
import { Wine } from './wine';

export interface Order {
  id: string;
  orderNumber: string;
  sellerId: string;
  seller?: User;
  buyerId: string;
  buyer?: User;
  status: OrderStatus;
  totalAmount: number;
  shippingCost?: number;
  paymentId?: string;
  paymentProvider?: PaymentProvider;
  paymentStatus: PaymentStatus;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  shippingLabelUrl?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  wine: Wine;
}

export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface CreateOrderRequest {
  items: {
    wineId: string;
    quantity: number;
  }[];
  shippingAddressId: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  total: number;
  itemCount: number;
}

