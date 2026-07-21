import prisma from "../../../database/prisma.js";

export const getAll = () => {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
};

export const getById = (id) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

export const create = (data) => {
  return prisma.category.create({
    data,
  });
};

export const update = (id, data) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const remove = (id) => {
  return prisma.category.delete({
    where: { id },
  });
};
