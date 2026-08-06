export type AnalyticsGroupBy = "day" | "week" | "month";

export type AnalyticsDatePreset =
  | "today"
  | "last7"
  | "last30"
  | "last90"
  | "custom";

export interface AnalyticsDateRangeParams {
  from?: string;
  to?: string;
}

export interface AnalyticsTrendsParams extends AnalyticsDateRangeParams {
  groupBy: AnalyticsGroupBy;
}

export interface AnalyticsProductsParams extends AnalyticsDateRangeParams {
  limit?: number;
  categoryId?: string;
}

export interface AnalyticsCustomersParams extends AnalyticsDateRangeParams {
  limit?: number;
}

export interface AnalyticsFilterState {
  preset: AnalyticsDatePreset;
  from: string;
  to: string;
  groupBy: AnalyticsGroupBy;
}

export interface AnalyticsOverview {
  orders: number;
  cancelledOrders: number;
  cancellationRate: number;
  grossOrderValue: number;
  recognizedRevenue: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface AnalyticsTrend {
  period: string;
  orders: number;
  cancelledOrders: number;
  grossOrderValue: number;
  recognizedRevenue: number;
  averageOrderValue: number;
}

export interface AnalyticsProductRow {
  menuItemId: string;
  name: string;
  quantitySold: number;
  grossRevenue: number;
  recognizedRevenue: number;
  orderCount: number;
}

export interface AnalyticsCategoryRow {
  categoryId: string;
  name: string;
  quantitySold: number;
  grossRevenue: number;
  recognizedRevenue: number;
  orderCount: number;
}

export interface AnalyticsProducts {
  topItems: AnalyticsProductRow[];
  topCategories: AnalyticsCategoryRow[];
}

export type AnalyticsOrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type AnalyticsPaymentMethod =
  | "EASYPAISA"
  | "JAZZCASH"
  | "BANK_TRANSFER"
  | "COD";

export type AnalyticsPaymentStatus =
  | "PENDING_VERIFICATION"
  | "UNPAID"
  | "PAID";

export interface AnalyticsOperations {
  orderStatusDistribution: Array<{
    status: AnalyticsOrderStatus;
    orders: number;
  }>;
  paymentMethodDistribution: Array<{
    paymentMethod: AnalyticsPaymentMethod;
    orders: number;
  }>;
  paymentStatusDistribution: Array<{
    paymentStatus: AnalyticsPaymentStatus;
    orders: number;
  }>;
  peakOrderingHours: Array<{
    hour: number;
    orders: number;
  }>;
}

export interface AnalyticsCustomerRow {
  customerId: string;
  name: string | null;
  whatsappId: string;
  orderCount: number;
  grossSpend: number;
  recognizedSpend: number;
}

export interface AnalyticsCustomers {
  newCustomers: number;
  returningCustomers: number;
  topCustomersBySpend: AnalyticsCustomerRow[];
  topCustomersByOrderCount: AnalyticsCustomerRow[];
}
