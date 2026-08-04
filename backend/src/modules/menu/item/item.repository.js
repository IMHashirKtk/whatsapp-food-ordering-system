import prisma from "../../../database/prisma.js";

/* ==========================
   Menu Items
========================== */

export const getAll = (restaurantId) => {
  return prisma.menuItem.findMany({
    where: {
      restaurantId,
    },
    include: {
      category: true,
      optionGroups: {
        include: {
          options: true,
        },
      },
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
};

export const getById = (id, restaurantId) => {
  return prisma.menuItem.findFirst({
    where: {
      id,
      restaurantId,
    },
    include: {
      category: true,
      optionGroups: {
        include: {
          options: true,
        },
      },
    },
  });
};

export const getByCategory = (categoryId, restaurantId) => {
  return prisma.menuItem.findMany({
    where: {
      categoryId,
      restaurantId,
    },
    include: {
      category: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
};

export const getCategoryById = (id, restaurantId) => {
  return prisma.category.findFirst({
    where: {
      id,
      restaurantId,
    },
  });
};

export const findByName = (restaurantId, categoryId, name) => {
  return prisma.menuItem.findUnique({
    where: {
      restaurantId_categoryId_name: {
        restaurantId,
        categoryId,
        name,
      },
    },
  });
};

export const create = (data) => {
  return prisma.menuItem.create({
    data,
  });
};

export const update = (id, restaurantId, data) => {
  return prisma.menuItem.update({
    where: {
      id,
      restaurantId,
    },
    data,
  });
};

export const remove = (id, restaurantId) => {
  return prisma.menuItem.deleteMany({
    where: {
      id,
      restaurantId,
    },
  });
};
