import prisma from "../../../database/prisma.js";

export const getAll = () => {
  return prisma.menuItem.findMany({
    include: {
      category: true,
      optionGroups: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getById = (id) => {
  return prisma.menuItem.findUnique({
    where: { id },
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

export const getByCategory = (categoryId) => {
  return prisma.menuItem.findMany({
    where: {
      categoryId,
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const create = (data) => {
  return prisma.menuItem.create({
    data,
  });
};

export const update = (id, data) => {
  return prisma.menuItem.update({
    where: {
      id,
    },
    data,
  });
};

export const remove = (id) => {
  return prisma.menuItem.delete({
    where: {
      id,
    },
  });
};
