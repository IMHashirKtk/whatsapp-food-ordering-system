import prisma from "../../database/prisma.js";

export const getByEmail = (email) => {
  return prisma.admin.findUnique({
    where: { email },
  });
};

export const getById = (id) => {
  return prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });
};
