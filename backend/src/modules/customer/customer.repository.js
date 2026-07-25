import prisma from "../../database/prisma.js";

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
