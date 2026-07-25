import prisma from "../../../database/prisma.js";

/* ==========================
   Options
========================== */

export const getAll = (restaurantId) => {
  return prisma.option.findMany({
    where: {
      optionGroup: {
        menuItem: {
          restaurantId,
        },
      },
    },
    include: {
      optionGroup: true,
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
  return prisma.option.findFirst({
    where: {
      id,
      optionGroup: {
        menuItem: {
          restaurantId,
        },
      },
    },
    include: {
      optionGroup: true,
    },
  });
};

export const getByGroup = (optionGroupId, restaurantId) => {
  return prisma.option.findMany({
    where: {
      optionGroupId,
      optionGroup: {
        menuItem: {
          restaurantId,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const create = (data) => {
  return prisma.option.create({
    data,
  });
};

export const update = async (id, restaurantId, data) => {
  await prisma.option.updateMany({
    where: {
      id,
      optionGroup: {
        menuItem: {
          restaurantId,
        },
      },
    },
    data,
  });

  return prisma.option.findFirst({
    where: {
      id,
      optionGroup: {
        menuItem: {
          restaurantId,
        },
      },
    },
    include: {
      optionGroup: true,
    },
  });
};

export const remove = (id, restaurantId) => {
  return prisma.option.deleteMany({
    where: {
      id,
      optionGroup: {
        menuItem: {
          restaurantId,
        },
      },
    },
  });
};
