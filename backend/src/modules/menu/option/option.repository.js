import prisma from "../../../database/prisma.js";

export const getAll = () => {
  return prisma.option.findMany({
    include: {
      optionGroup: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
};

export const getById = (id) => {
  return prisma.option.findUnique({
    where: { id },
    include: {
      optionGroup: true,
    },
  });
};

export const getByGroup = (optionGroupId) => {
  return prisma.option.findMany({
    where: {
      optionGroupId,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const create = (data) =>
  prisma.option.create({
    data,
  });

export const update = (id, data) =>
  prisma.option.update({
    where: { id },
    data,
  });

export const remove = (id) =>
  prisma.option.delete({
    where: { id },
  });
