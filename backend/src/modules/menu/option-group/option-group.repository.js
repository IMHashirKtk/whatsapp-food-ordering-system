import prisma from "../../../database/prisma.js";

/* ==========================
   Option Groups
========================== */

export const getAll = (restaurantId) => {
  return prisma.optionGroup.findMany({
    where: {
      menuItem: {
        restaurantId,
      },
    },
    include: {
      options: true,
      menuItem: true,
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
  return prisma.optionGroup.findFirst({
    where: {
      id,
      menuItem: {
        restaurantId,
      },
    },
    include: {
      options: true,
      menuItem: true,
    },
  });
};

export const getByMenuItem = (menuItemId, restaurantId) => {
  return prisma.optionGroup.findMany({
    where: {
      menuItemId,
      menuItem: {
        restaurantId,
      },
    },
    include: {
      options: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const getMenuItemById = (id, restaurantId) => {
  return prisma.menuItem.findFirst({
    where: {
      id,
      restaurantId,
    },
  });
};

export const create = (data) => {
  return prisma.optionGroup.create({
    data,
  });
};

export const update = async (id, restaurantId, data) => {
  await prisma.optionGroup.updateMany({
    where: {
      id,
      menuItem: {
        restaurantId,
      },
    },
    data,
  });

  return prisma.optionGroup.findFirst({
    where: {
      id,
      menuItem: {
        restaurantId,
      },
    },
    include: {
      options: true,
      menuItem: true,
    },
  });
};

export const remove = (id, restaurantId) => {
  return prisma.optionGroup.deleteMany({
    where: {
      id,
      menuItem: {
        restaurantId,
      },
    },
  });
};
