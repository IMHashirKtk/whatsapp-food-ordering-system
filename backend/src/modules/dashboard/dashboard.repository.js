import prisma from "../../database/prisma.js";

export const getSummary = async (restaurantId) => {
  const today = new Date();

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    customers,
    menuItems,
    categories,
    pendingOrders,
    todayOrders,
    monthOrders,
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
        status: "PENDING",
      },
    }),

    prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfToday,
        },
      },
      select: {
        total: true,
      },
    }),

    prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      select: {
        total: true,
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
      include: {
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

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  const monthRevenue = monthOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  return {
    today: {
      orders: todayOrders.length,
      revenue: todayRevenue,
    },

    month: {
      orders: monthOrders.length,
      revenue: monthRevenue,
    },

    pendingOrders,

    customers,

    menuItems,

    categories,

    recentOrders,
  };
};
