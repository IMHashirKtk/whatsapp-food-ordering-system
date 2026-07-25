import prisma from "../../database/prisma.js";

/* ==========================
   Categories
========================== */

export const getActiveCategories = (restaurantId) => {
  return prisma.category.findMany({
    where: {
      restaurantId,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
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

/* ==========================
   Menu Items
========================== */

export const getMenuItemById = (id, restaurantId) => {
  return prisma.menuItem.findFirst({
    where: {
      id,
      restaurantId,
    },
    include: {
      category: true,
      optionGroups: {
        include: {
          options: {
            where: {
              isAvailable: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });
};

export const getMenuItemsByCategory = (categoryId, restaurantId) => {
  return prisma.menuItem.findMany({
    where: {
      categoryId,
      restaurantId,
      isAvailable: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getMenuItemWithOptions = (menuItemId, restaurantId) => {
  return prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      restaurantId,
    },
    include: {
      optionGroups: {
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          options: {
            where: {
              isAvailable: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });
};
