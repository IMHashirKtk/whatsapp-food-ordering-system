import prisma from "../../database/prisma.js";

export const getByEmail = (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      restaurant: true,
    },
  });
};

export const getById = (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      restaurantId: true,
      createdAt: true,

      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          currency: true,
        },
      },
    },
  });
};
