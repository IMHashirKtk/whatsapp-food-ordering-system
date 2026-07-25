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

export const getOrders = ({ restaurantId, page = 1, limit = 20, status }) => {
  return prisma.order.findMany({
    where: {
      restaurantId,
      ...(status && { status }),
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
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const countOrders = ({ restaurantId, status }) => {
  return prisma.order.count({
    where: {
      restaurantId,
      ...(status && { status }),
    },
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
