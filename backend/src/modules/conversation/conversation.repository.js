import prisma from "../../database/prisma.js";

export const getByCustomerId = (customerId) => {
  return prisma.conversation.findUnique({
    where: {
      customerId,
    },
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

export const update = (customerId, data) => {
  return prisma.conversation.update({
    where: {
      customerId,
    },
    data,
  });
};

export const upsert = (customerId, data) => {
  return prisma.conversation.upsert({
    where: {
      customerId,
    },
    create: {
      customerId,
      state: data.state ?? "MAIN_MENU",
      context: data.context ?? {},
    },
    update: data,
  });
};
