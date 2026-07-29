import prisma from "../../database/prisma.js";
import { OrderStatus } from "@prisma/client";

const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];

const STATUS_KEY_MAP = {
  [OrderStatus.PENDING]: "pending",
  [OrderStatus.ACCEPTED]: "accepted",
  [OrderStatus.PREPARING]: "preparing",
  [OrderStatus.READY]: "ready",
  [OrderStatus.OUT_FOR_DELIVERY]: "outForDelivery",
};

export const getSummary = async (restaurantId) => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    customers,
    menuItems,
    categories,

    todayOrders,
    monthOrders,

    todayRevenue,
    monthRevenue,

    statusCounts,

    recentOrders,
  ] = await Promise.all([
    prisma.customer.count({
      where: {
        restaurantId,
      },
    }),

    prisma.menuItem.count({
      where: {
        restaurantId,
      },
    }),

    prisma.category.count({
      where: {
        restaurantId,
      },
    }),

    prisma.order.count({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfToday,
        },
      },
    }),

    prisma.order.count({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),

    prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfToday,
        },
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.groupBy({
      by: ["status"],

      where: {
        restaurantId,
        status: {
          in: ACTIVE_ORDER_STATUSES,
        },
      },

      _count: {
        status: true,
      },
    }),

    prisma.order.findMany({
      where: {
        restaurantId,
      },

      take: 10,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            whatsappId: true,
          },
        },
      },
    }),
  ]);

  const orderStatus = {
    pending: 0,
    accepted: 0,
    preparing: 0,
    ready: 0,
    outForDelivery: 0,
  };

  statusCounts.forEach(({ status, _count }) => {
    const key = STATUS_KEY_MAP[status];

    if (key) {
      orderStatus[key] = _count.status;
    }
  });

  return {
    stats: {
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total ?? 0),

      monthOrders,
      monthRevenue: Number(monthRevenue._sum.total ?? 0),

      customers,
      menuItems,
      categories,
    },

    orderStatus,

    recentOrders,
  };
};
