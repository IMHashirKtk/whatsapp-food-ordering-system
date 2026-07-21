import prisma from "../../database/prisma.js";

export const getStats = async () => {
  const [customers, orders, menuItems, categories] = await Promise.all([
    prisma.customer.count(),
    prisma.order.count(),
    prisma.menuItem.count(),
    prisma.category.count(),
  ]);

  return {
    customers,
    orders,
    menuItems,
    categories,
  };
};

export const getRecentOrders = () => {
  return prisma.order.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: true,
    },
  });
};
