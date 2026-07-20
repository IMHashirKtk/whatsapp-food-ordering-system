import prisma from "../../database/prisma.js";

/* ==========================
   Orders
========================== */

export const createOrder = (data, db = prisma) => {
  return db.order.create({
    data,
  });
};

export const getOrderById = (id) => {
  return prisma.order.findUnique({
    where: { id },
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

export const getOrderByNumber = (orderNumber) => {
  return prisma.order.findUnique({
    where: { orderNumber },
  });
};

export const getCustomerOrders = (customerId) => {
  return prisma.order.findMany({
    where: { customerId },
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

export const updateStatus = (id, status, db = prisma) => {
  return db.order.update({
    where: { id },
    data: { status },
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
