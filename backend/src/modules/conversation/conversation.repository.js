import prisma from "../../database/prisma.js";

export const getById = (id) => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      restaurant: {
        include: {
          settings: true,
        },
      },
      customer: true,
    },
  });
};

export const getByCustomerId = (customerId) => {
  return prisma.conversation.findUnique({
    where: {
      customerId,
    },
    include: {
      restaurant: {
        include: {
          settings: true,
        },
      },
      customer: true,
    },
  });
};

export const create = (customerId, restaurantId) => {
  return prisma.conversation.create({
    data: {
      customerId,
      restaurantId,
      state: "MAIN_MENU",
      context: {},
    },
  });
};

export const updateById = (id, data) => {
  return prisma.conversation.update({
    where: { id },
    data,
  });
};
