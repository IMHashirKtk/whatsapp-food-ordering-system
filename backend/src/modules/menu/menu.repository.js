import prisma from "../../database/prisma.js";

/* ==========================
   Categories
========================== */

export const createCategory = (data) => {
  return prisma.category.create({
    data,
  });
};

export const getAllCategories = () => {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      _count: {
        select: {
          menuItems: true,
        },
      },
    },
  });
};

export const getCategoryById = (id) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      menuItems: true,
    },
  });
};

export const findCategoryByName = (name) => {
  return prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
};

export const updateCategory = (id, data) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = (id) => {
  return prisma.category.delete({
    where: { id },
  });
};

/* ==========================
   Menu Items
========================== */

export const createMenuItem = (data) => {
  return prisma.menuItem.create({
    data,
  });
};

export const getAllMenuItems = () => {
  return prisma.menuItem.findMany({
    where: {
      isAvailable: true,
    },
    orderBy: {
      createdAt: "desc",
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

export const getMenuItemById = (id) => {
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

export const findMenuItemByName = (name) => {
  return prisma.menuItem.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
};

export const updateMenuItem = (id, data) => {
  return prisma.menuItem.update({
    where: { id },
    data,
  });
};

export const deleteMenuItem = (id) => {
  return prisma.menuItem.delete({
    where: { id },
  });
};

/* ==========================
   Option Groups
========================== */

export const createOptionGroup = (data) => {
  return prisma.optionGroup.create({
    data,
  });
};

export const getOptionGroups = (menuItemId) => {
  return prisma.optionGroup.findMany({
    where: { menuItemId },
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
  });
};

export const getOptionGroupById = (id) => {
  return prisma.optionGroup.findUnique({
    where: { id },
    include: {
      options: true,
    },
  });
};

export const updateOptionGroup = (id, data) => {
  return prisma.optionGroup.update({
    where: { id },
    data,
  });
};

export const deleteOptionGroup = (id) => {
  return prisma.optionGroup.delete({
    where: { id },
  });
};

/* ==========================
   Options
========================== */

export const createOption = (data) => {
  return prisma.option.create({
    data,
  });
};

export const getOptions = (optionGroupId) => {
  return prisma.option.findMany({
    where: { optionGroupId },
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const getOptionById = (id) => {
  return prisma.option.findUnique({
    where: { id },
  });
};

export const updateOption = (id, data) => {
  return prisma.option.update({
    where: { id },
    data,
  });
};

export const deleteOption = (id) => {
  return prisma.option.delete({
    where: { id },
  });
};

/* ==========================
   Complete Menu Tree
========================== */

export const getMenuTree = () => {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      menuItems: {
        where: {
          isAvailable: true,
        },
        orderBy: {
          createdAt: "asc",
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
      },
    },
  });
};
