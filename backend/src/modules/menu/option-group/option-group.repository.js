import prisma from "../../../database/prisma.js";

export const getAll = () => {
  return prisma.optionGroup.findMany({
    include: {
      options: true,
      menuItem: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
};

export const getById = (id) => {
  return prisma.optionGroup.findUnique({
    where: { id },
    include: {
      options: true,
      menuItem: true,
    },
  });
};

export const getByMenuItem = (menuItemId) => {
  return prisma.optionGroup.findMany({
    where: { menuItemId },
    include: {
      options: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const create = (data) => {
  return prisma.optionGroup.create({
    data,
  });
};

export const update = (id, data) => {
  return prisma.optionGroup.update({
    where: { id },
    data,
  });
};

export const remove = (id) => {
  return prisma.optionGroup.delete({
    where: { id },
  });
};
