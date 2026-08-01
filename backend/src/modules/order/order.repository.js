import prisma from "../../database/prisma.js";

/* ==========================
   Orders
========================== */

export const createOrder = (data, db = prisma) => {
  return db.order.create({
    data,
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

export const getCustomerOrders = (customerId, restaurantId) => {
  return prisma.order.findMany({
    where: {
      customerId,
      restaurantId,
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

export const getOrders = ({
  restaurantId,
  page = 1,
  limit = 20,
  status,
  search,
}) => {
  return prisma.order.findMany({
    where: buildOrdersWhere({ restaurantId, status, search }),
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          whatsappId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const countOrders = ({ restaurantId, status, search }) => {
  return prisma.order.count({
    where: buildOrdersWhere({ restaurantId, status, search }),
  });
};

export const updateStatus = async (id, restaurantId, status, db = prisma) => {
  await db.order.updateMany({
    where: {
      id,
      restaurantId,
    },
    data: {
      status,
    },
  });

  return db.order.findFirst({
    where: {
      id,
      restaurantId,
    },
  });
};

export const updateCustomerStats = (customerId, total, db = prisma) => {
  return db.customer.update({
    where: {
      id: customerId,
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
