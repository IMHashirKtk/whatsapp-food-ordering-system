export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;

  monthOrders: number;
  monthRevenue: number;

  customers: number;
  menuItems: number;
  categories: number;
}

export interface DashboardOrderStatus {
  pending: number;
  accepted: number;
  preparing: number;
  ready: number;
  outForDelivery: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;

  customer: {
    id: string;
    name: string;
    whatsappId: string;
  };
}

export interface DashboardSummary {
  stats: DashboardStats;
  orderStatus: DashboardOrderStatus;
  recentOrders: RecentOrder[];
}