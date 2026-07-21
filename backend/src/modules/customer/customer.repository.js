import prisma from "../../database/prisma.js";

export const getAll = () => {
  return prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getByWhatsappId = (whatsappId) => {
  return prisma.customer.findUnique({
    where: {
      whatsappId,
    },
  });
};

export const getById = (id) => {
  return prisma.customer.findUnique({
    where: {
      id,
    },
  });
};

export const create = (data) => {
  return prisma.customer.create({
    data,
  });
};

export const update = (id, data) => {
  return prisma.customer.update({
    where: {
      id,
    },
    data,
  });
};

export const remove = (id) => {
  return prisma.customer.delete({
    where: {
      id,
    },
  });
};
