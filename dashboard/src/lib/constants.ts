import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

export const APP = {
  NAME: "Foodaji",
  DESCRIPTION: "Restaurant Management Dashboard",
};

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    title: "Menu",
    href: "/dashboard/menu",
    icon: ShoppingBag,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
] as const;

export const TOKEN_KEY = "foodaji_access_token";
export const ORDER_SOUND_MUTED_KEY = "foodaji_order_sound_muted";
export const MAX_PROCESSED_ORDER_EVENTS = 100;
