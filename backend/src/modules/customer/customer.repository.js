import prisma from "../../database/prisma.js";

const customerSelect = {
  id: true,
  whatsappId: true,
  name: true,
  email: true,
  address: true,
  createdAt: true,
  updatedAt: true,
  lastOrderAt: true,
  lifetimeSpend: true,
  totalOrders: true,
};

const buildCustomerWhere = ({ restaurantId, search }) => ({
  restaurantId,
  ...(search && {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { whatsappId: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ],
  }),
});

/* ==========================
   Customers
========================== */

export const getAll = (restaurantId) => {
  return prisma.customer.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPage = async ({ restaurantId, page, limit, search }) => {
  const where = buildCustomerWhere({ restaurantId, search });

  return prisma.customer.findMany({
    where,
    select: customerSelect,
    orderBy: [
      { lastOrderAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const count = ({ restaurantId, search }) =>
  prisma.customer.count({
    where: buildCustomerWhere({ restaurantId, search }),
  });

export const getByWhatsappId = (restaurantId, whatsappId) => {
  return prisma.customer.findUnique({
    where: {
      restaurantId_whatsappId: {
        restaurantId,
        whatsappId,
      },
    },
  });
};

export const getById = (id, restaurantId) => {
  return prisma.customer.findFirst({
    where: {
      id,
      restaurantId,
    },
  });
};

export const getDetailById = (id, restaurantId) =>
  prisma.customer.findFirst({
    where: {
      id,
      restaurantId,
    },
    select: customerSelect,
  });

export const getOrderSummary = async (customerId, restaurantId) => {
  const where = {
    customerId,
    restaurantId,
  };

  const [statusGroups, paymentStatusGroups, average] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),
    prisma.order.groupBy({
      by: ["paymentStatus"],
      where,
      _count: {
        _all: true,
      },
    }),
    prisma.order.aggregate({
      where,
      _avg: {
        total: true,
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    statusGroups.map((group) => [group.status, group._count._all]),
  );
  const paymentStatusCounts = Object.fromEntries(
    paymentStatusGroups.map((group) => [
      group.paymentStatus,
      group._count._all,
    ]),
  );

  return {
    pendingOrders: statusCounts.PENDING ?? 0,
    activeOrders:
      (statusCounts.ACCEPTED ?? 0) +
      (statusCounts.PREPARING ?? 0) +
      (statusCounts.READY ?? 0) +
      (statusCounts.OUT_FOR_DELIVERY ?? 0),
    deliveredOrders: statusCounts.DELIVERED ?? 0,
    cancelledOrders: statusCounts.CANCELLED ?? 0,
    unpaidOrders: paymentStatusCounts.UNPAID ?? 0,
    pendingVerificationOrders:
      paymentStatusCounts.PENDING_VERIFICATION ?? 0,
    paidOrders: paymentStatusCounts.PAID ?? 0,
    averageOrderValue: average._avg.total?.toString() ?? "0.00",
  };
};

export const create = (data) => {
  return prisma.customer.create({
    data,
  });
};

export const update = async (id, restaurantId, data) => {
  await prisma.customer.updateMany({
    where: {
      id,
      restaurantId,
    },
    data,
  });

  return prisma.customer.findFirst({
    where: {
      id,
      restaurantId,
    },
  });
};

export const remove = (id, restaurantId) => {
  return prisma.customer.deleteMany({
    where: {
      id,
      restaurantId,
    },
  });
};
