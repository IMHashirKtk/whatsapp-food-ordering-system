import * as menuRepository from "./menu.repository.js";
import AppError from "../../utils/AppError.js";

/* ==========================
   Categories
========================== */

export const createCategory = async (data) => {
  const existing = await menuRepository.findCategoryByName(data.name);

  if (existing) {
    throw new AppError("Category already exists.", 400);
  }

  return menuRepository.createCategory(data);
};

export const getAllCategories = () => {
  return menuRepository.getAllCategories();
};

export const getCategoryById = async (id) => {
  const category = await menuRepository.getCategoryById(id);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

export const updateCategory = async (id, data) => {
  await getCategoryById(id);

  if (data.name) {
    const existing = await menuRepository.findCategoryByName(data.name);

    if (existing && existing.id !== id) {
      throw new AppError("Category already exists.", 400);
    }
  }

  return menuRepository.updateCategory(id, data);
};

export const deleteCategory = async (id) => {
  await getCategoryById(id);

  return menuRepository.deleteCategory(id);
};

/* ==========================
   Menu Items
========================== */

export const createMenuItem = async (data) => {
  await getCategoryById(data.categoryId);

  const existing = await menuRepository.findMenuItemByName(data.name);

  if (existing) {
    throw new AppError("Menu item already exists.", 400);
  }

  return menuRepository.createMenuItem(data);
};

export const getAllMenuItems = () => {
  return menuRepository.getAllMenuItems();
};

export const getMenuItemById = async (id) => {
  const item = await menuRepository.getMenuItemById(id);

  if (!item) {
    throw new AppError("Menu item not found.", 404);
  }

  return item;
};

export const updateMenuItem = async (id, data) => {
  await getMenuItemById(id);

  if (data.categoryId) {
    await getCategoryById(data.categoryId);
  }

  if (data.name) {
    const existing = await menuRepository.findMenuItemByName(data.name);

    if (existing && existing.id !== id) {
      throw new AppError("Menu item already exists.", 400);
    }
  }

  return menuRepository.updateMenuItem(id, data);
};

export const deleteMenuItem = async (id) => {
  await getMenuItemById(id);

  return menuRepository.deleteMenuItem(id);
};

/* ==========================
   Option Groups
========================== */

export const createOptionGroup = async (data) => {
  await getMenuItemById(data.menuItemId);

  return menuRepository.createOptionGroup(data);
};

export const getOptionGroups = (menuItemId) => {
  return menuRepository.getOptionGroups(menuItemId);
};

export const updateOptionGroup = async (id, data) => {
  const group = await menuRepository.getOptionGroupById(id);

  if (!group) {
    throw new AppError("Option group not found.", 404);
  }

  return menuRepository.updateOptionGroup(id, data);
};

export const deleteOptionGroup = async (id) => {
  const group = await menuRepository.getOptionGroupById(id);

  if (!group) {
    throw new AppError("Option group not found.", 404);
  }

  return menuRepository.deleteOptionGroup(id);
};

/* ==========================
   Options
========================== */

export const createOption = async (data) => {
  const group = await menuRepository.getOptionGroupById(data.optionGroupId);

  if (!group) {
    throw new AppError("Option group not found.", 404);
  }

  return menuRepository.createOption(data);
};

export const getOptions = (optionGroupId) => {
  return menuRepository.getOptions(optionGroupId);
};

export const updateOption = async (id, data) => {
  const option = await menuRepository.getOptionById(id);

  if (!option) {
    throw new AppError("Option not found.", 404);
  }

  return menuRepository.updateOption(id, data);
};

export const deleteOption = async (id) => {
  const option = await menuRepository.getOptionById(id);

  if (!option) {
    throw new AppError("Option not found.", 404);
  }

  return menuRepository.deleteOption(id);
};

/* ==========================
   Complete Menu
========================== */

export const getMenuTree = () => {
  return menuRepository.getMenuTree();
};

export const getOptionGroupById = async (id) => {
  const group = await menuRepository.getOptionGroupById(id);

  if (!group) {
    throw new AppError("Option group not found.", 404);
  }

  return group;
};

export const getOptionById = async (id) => {
  const option = await menuRepository.getOptionById(id);

  if (!option) {
    throw new AppError("Option not found.", 404);
  }

  return option;
};
