import prisma from "../../../database/prisma.js";

/* ==========================
   Categories
========================== */

export const getAll = (restaurantId) => {
  return prisma.category.findMany({
    where: {
      restaurantId,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    include: {
      _count: {
        select: {
          menuItems: true,
        },
      },
    },
  });
};

export const getById = (id, restaurantId) => {
  return prisma.category.findFirst({
    where: {
      id,
      restaurantId,
    },
    include: {
      menuItems: true,
    },
  });
};

export const findByName = (restaurantId, name) => {
  return prisma.category.findUnique({
    where: {
      restaurantId_name: {
        restaurantId,
        name,
      },
    },
  });
};

export const create = (data) => {
  return prisma.category.create({
    data,
  });
};

export const update = async (id, restaurantId, data) => {
  await prisma.category.updateMany({
    where: {
      id,
      restaurantId,
    },
    data,
  });

  return prisma.category.findFirst({
    where: {
      id,
      restaurantId,
    },
    include: {
      menuItems: true,
    },
  });
};

export const remove = (id, restaurantId) => {
  return prisma.category.deleteMany({
    where: {
      id,
      restaurantId,
    },
  });
};
