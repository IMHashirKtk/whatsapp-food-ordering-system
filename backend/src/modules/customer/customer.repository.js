import prisma from "../../database/prisma.js";

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

export const create = ({ whatsappId, name }) => {
  return prisma.customer.create({
    data: {
      whatsappId,
      name,
    },
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
