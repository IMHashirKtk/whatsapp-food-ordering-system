import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/features/orders/types";

export interface DashboardRestaurant {
  name: string;
  timezone: string;
  isOpen: boolean;
  openingTime: string | null;
  closingTime: string | null;
  orderAcceptanceEnabled: boolean;
}

export interface DashboardToday {
  orders: number;
  grossOrderValue: number;
  recognizedRevenue: number;
  averageOrderValue: number;
  deliveredOrders: number;
  cancelledOrders: number;
  newCustomers: number;
}

export interface DashboardLiveOrders {
  pending: number;
  accepted: number;
  preparing: number;
  ready: number;
  outForDelivery: number;
  active: number;
}

export interface DashboardSignals {
  pendingPaymentVerification: number;
  unavailableMenuItems: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  customer: {
    id: string;
    name: string | null;
    whatsappId: string;
  };
}

export interface DashboardSummary {
  restaurant: DashboardRestaurant;
  today: DashboardToday;
  liveOrders: DashboardLiveOrders;
  signals: DashboardSignals;
  recentOrders: DashboardRecentOrder[];
}
