export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type MonetaryAmount = number | string;

export interface OrderCustomer {
  id: string;
  name: string | null;
  phone?: string | null;
  whatsappId?: string | null;
  address?: string | null;
}

export interface OrderMenuItem {
  id: string;
  name: string;
}

export interface OrderItemOption {
  id: string;
  optionId: string;
  name: string;
  extraPrice: MonetaryAmount;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  basePrice: MonetaryAmount;
  totalPrice: MonetaryAmount;
  options: OrderItemOption[];
  menuItem?: OrderMenuItem;
}

export interface Order {
  id: string;
  orderNumber: string;

  customer: OrderCustomer;

  deliveryAddress: string | null;

  subtotal: MonetaryAmount;
  tax: MonetaryAmount;
  deliveryFee: MonetaryAmount;
  total: MonetaryAmount;

  paymentMethod: string;
  paymentStatus: string;

  status: OrderStatus;
  notes?: string | null;
  cancellationReason?: string | null;

  createdAt: string;
  updatedAt: string;

  items?: OrderItem[];
  itemCount?: number;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: OrdersPagination;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  cancellationReason?: string;
}
