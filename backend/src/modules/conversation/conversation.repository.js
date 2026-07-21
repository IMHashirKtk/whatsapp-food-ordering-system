import prisma from "../../database/prisma.js";

export const getById = (id) => {
  return prisma.conversation.findUnique({
    where: { id },
  });
};

export const getByCustomerId = (customerId) => {
  return prisma.conversation.findUnique({
    where: { customerId },
  });
};

export const create = (customerId) => {
  return prisma.conversation.create({
    data: {
      customerId,
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
