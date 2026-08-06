export type MonetaryAmount = number | string;

export type CustomerOrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type CustomerPaymentStatus =
  | "PENDING_VERIFICATION"
  | "UNPAID"
  | "PAID";

export interface Customer {
  id: string;
  whatsappId: string;
  name: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  lastOrderAt: string | null;
  lifetimeSpend: MonetaryAmount;
  totalOrders: number;
}

export interface CustomerSummary {
  pendingOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  unpaidOrders: number;
  pendingVerificationOrders: number;
  paidOrders: number;
  averageOrderValue: MonetaryAmount;
}

export interface CustomerDetail {
  customer: Customer;
  summary: CustomerSummary;
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomersListResult {
  customers: Customer[];
  pagination: CustomerPagination;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetCustomerOrdersParams {
  page?: number;
  limit?: number;
  status?: CustomerOrderStatus;
  paymentStatus?: CustomerPaymentStatus;
}

export interface CustomerUpdatePayload {
  name: string | null;
  whatsappId: string;
  email: string | null;
  address: string | null;
}

export interface CustomerOrderMenuItem {
  id: string;
  name: string;
}

export interface CustomerOrderOption {
  id: string;
  optionId: string;
  name: string;
  extraPrice: MonetaryAmount;
}

export interface CustomerOrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  basePrice: MonetaryAmount;
  totalPrice: MonetaryAmount;
  menuItem: CustomerOrderMenuItem | null;
  options: CustomerOrderOption[];
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: CustomerOrderStatus;
  subtotal: MonetaryAmount;
  tax: MonetaryAmount;
  deliveryFee: MonetaryAmount;
  total: MonetaryAmount;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  deliveryAddress: string | null;
  estimatedReadyTime: number | null;
  paymentMethod: string;
  paymentStatus: CustomerPaymentStatus;
  items: CustomerOrderItem[];
}
