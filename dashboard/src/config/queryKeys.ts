import type { GetOrdersParams } from "@/features/orders/types";
import type {
  GetCustomerOrdersParams,
  GetCustomersParams,
} from "@/features/customers/types";

export const queryKeys = {
  dashboard: ["dashboard"] as const,

  settings: {
    all: ["settings"] as const,
    detail: ["settings", "detail"] as const,
  },

  orders: {
    all: ["orders"] as const,
    list: (params?: GetOrdersParams) => {
      const normalizedParams = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        status: params?.status ?? "all",
        search: params?.search ?? "",
      };

      return ["orders", "list", normalizedParams] as const;
    },
    detail: (id: string) => ["orders", "detail", id] as const,
  },

  customers: {
    all: ["customers"] as const,
    list: (params?: GetCustomersParams) => [
      "customers",
      "list",
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        search: params?.search?.trim() || "",
      },
    ] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
    orders: (id: string, params?: GetCustomerOrdersParams) => [
      "customers",
      "orders",
      id,
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        status: params?.status ?? "all",
        paymentStatus: params?.paymentStatus ?? "all",
      },
    ] as const,
  },

  menu: {
    all: ["menu"] as const,
    categories: {
      all: ["menu", "categories"] as const,
      detail: (id: string) => ["menu", "categories", "detail", id] as const,
    },
    items: {
      all: ["menu", "items"] as const,
      byCategory: (categoryId: string) =>
        ["menu", "items", "category", categoryId] as const,
      detail: (id: string) => ["menu", "items", "detail", id] as const,
    },
    optionGroups: {
      all: ["menu", "option-groups"] as const,
      byMenuItem: (menuItemId: string) =>
        ["menu", "option-groups", "menu-item", menuItemId] as const,
      detail: (id: string) =>
        ["menu", "option-groups", "detail", id] as const,
    },
    options: {
      all: ["menu", "options"] as const,
      byGroup: (optionGroupId: string) =>
        ["menu", "options", "group", optionGroupId] as const,
      detail: (id: string) => ["menu", "options", "detail", id] as const,
    },
  },
};
