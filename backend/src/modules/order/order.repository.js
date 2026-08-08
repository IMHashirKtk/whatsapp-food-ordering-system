import prisma from "../../database/prisma.js";

/* ==========================
   Orders
========================== */

export const createOrder = (data, db = prisma) => {
  return db.order.create({
    data,
  });
};

export const createOrderWithCustomerSummary = (data, db = prisma) => {
  return db.order.create({
    data,
    include: {
      customer: {
        select: {
          name: true,
          whatsappId: true,
        },
      },
    },
  });
};

export const getOrderById = (id, restaurantId) => {
  return prisma.order.findFirst({
    where: {
      id,
      restaurantId,
    },
    include: {
      customer: true,
      items: {
        include: {
          menuItem: true,
          options: true,
        },
      },
    },
  });
};

export const getOrderByNumber = (orderNumber, restaurantId) => {
  return prisma.order.findFirst({
    where: {
      orderNumber,
      restaurantId,
    },
  });
};

const buildCustomerOrdersWhere = ({
  customerId,
  restaurantId,
  status,
  paymentStatus,
}) => ({
  customerId,
  restaurantId,
  ...(status && { status }),
  ...(paymentStatus && { paymentStatus }),
});

const customerOrderInclude = {
  items: {
    include: {
      menuItem: true,
      options: true,
    },
  },
};

export const getCustomerOrders = (
  customerId,
  restaurantId,
  { status, paymentStatus } = {},
) => {
  return prisma.order.findMany({
    where: buildCustomerOrdersWhere({
      customerId,
      restaurantId,
      status,
      paymentStatus,
    }),
    include: customerOrderInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
};

export const getOrderBySourceMessageId = (
  sourceMessageId,
  restaurantId,
  customerId,
) => {
  if (!sourceMessageId) {
    return null;
  }

  return prisma.order.findFirst({
    where: {
      sourceMessageId,
      restaurantId,
      customerId,
    },
    include: {
      customer: {
        select: {
          name: true,
          whatsappId: true,
        },
      },
    },
  });
};

export const getCustomerOrdersPage = async ({
  customerId,
  restaurantId,
  page,
  limit,
  status,
  paymentStatus,
}) =>
  prisma.order.findMany({
    where: buildCustomerOrdersWhere({
      customerId,
      restaurantId,
      status,
      paymentStatus,
    }),
    include: customerOrderInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * limit,
    take: limit,
  });

export const countCustomerOrders = ({
  customerId,
  restaurantId,
  status,
  paymentStatus,
}) =>
  prisma.order.count({
    where: buildCustomerOrdersWhere({
      customerId,
      restaurantId,
      status,
      paymentStatus,
    }),
  });

export const getActiveCustomerOrders = (customerId, restaurantId) => {
  return prisma.order.findMany({
    where: {
      customerId,
      restaurantId,
      status: {
        in: ["PENDING", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"],
      },
    },
    include: {
      items: {
        include: {
          menuItem: true,
          options: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const buildOrdersWhere = ({ restaurantId, status, search }) => {
  return {
    restaurantId,
    ...(status && { status }),
    ...(search && {
      OR: [
        {
          orderNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            is: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          customer: {
            is: {
              whatsappId: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }),
  };
};

export const getOrders = async ({
  restaurantId,
  page = 1,
  limit = 20,
  status,
  search,
}) => {
  const orders = await prisma.order.findMany({
    where: buildOrdersWhere({ restaurantId, status, search }),
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          whatsappId: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return orders.map(({ _count, ...order }) => ({
    ...order,
    itemCount: _count.items,
  }));
};

export const countOrders = ({ restaurantId, status, search }) => {
  return prisma.order.count({
    where: buildOrdersWhere({ restaurantId, status, search }),
  });
};

export const updateStatus = async (
  id,
  restaurantId,
  currentStatus,
  status,
  cancellationReason,
  db = prisma,
) => {
  const result = await db.order.updateMany({
    where: {
      id,
      restaurantId,
      status: currentStatus,
    },
    data: {
      status,
      ...(status === "CANCELLED" && { cancellationReason }),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return db.order.findFirst({
    where: {
      id,
      restaurantId,
    },
  });
};

export const updateCustomerStats = async (
  customerId,
  restaurantId,
  total,
  db = prisma,
) => {
  const result = await db.customer.updateMany({
    where: {
      id: customerId,
      restaurantId,
    },
    data: {
      totalOrders: {
        increment: 1,
      },
      lifetimeSpend: {
        increment: total,
      },
      lastOrderAt: new Date(),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return db.customer.findFirst({
    where: {
      id: customerId,
      restaurantId,
    },
  });
};

export const updatePaymentStatus = async (
  id,
  restaurantId,
  currentPaymentStatus,
  paymentStatus,
  paymentVerifiedBy,
  paymentVerificationNote,
  db = prisma,
) => {
  const result = await db.order.updateMany({
    where: {
      id,
      restaurantId,
      paymentStatus: currentPaymentStatus,
    },
    data: {
      paymentStatus,
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy,
      paymentVerificationNote,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return db.order.findFirst({
    where: {
      id,
      restaurantId,
    },
    include: {
      customer: true,
      items: {
        include: {
          menuItem: true,
          options: true,
        },
      },
    },
  });
};

/* ==========================
   Order Items
========================== */

export const createOrderItem = (data, db = prisma) => {
  return db.orderItem.create({
    data,
  });
};

export const createOrderItemOption = (data, db = prisma) => {
  return db.orderItemOption.create({
    data,
  });
};

/* ==========================
   Transactions
========================== */

export const transaction = (callback) => {
  return prisma.$transaction(callback);
};
