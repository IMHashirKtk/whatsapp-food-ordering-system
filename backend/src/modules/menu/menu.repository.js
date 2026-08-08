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
      isAvailable: true,
      category: {
        isActive: true,
      },
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
      category: {
        isActive: true,
      },
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
      isAvailable: true,
      category: {
        isActive: true,
      },
    },
    include: {
      category: true,
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

export const getMenuItemsForCheckout = (
  menuItemIds,
  restaurantId,
  db = prisma,
) => {
  if (!menuItemIds.length) {
    return Promise.resolve([]);
  }

  return db.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      restaurantId,
    },
    include: {
      category: true,
      optionGroups: {
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          options: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });
};
