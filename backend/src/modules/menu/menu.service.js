import * as menuRepository from "./menu.repository.js";
import AppError from "../../utils/AppError.js";

/* ==========================
   Categories
========================== */

export const getActiveCategories = async (restaurantId) => {
  return menuRepository.getActiveCategories(restaurantId);
};

export const getCategoryById = async (categoryId, restaurantId) => {
  const category = await menuRepository.getCategoryById(
    categoryId,
    restaurantId,
  );

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

/* ==========================
   Menu Items
========================== */

export const getMenuItemsByCategory = async (categoryId, restaurantId) => {
  await getCategoryById(categoryId, restaurantId);

  return menuRepository.getMenuItemsByCategory(categoryId, restaurantId);
};

export const getMenuItemById = async (menuItemId, restaurantId) => {
  const item = await menuRepository.getMenuItemById(menuItemId, restaurantId);

  if (!item) {
    throw new AppError("Menu item not found.", 404);
  }

  return item;
};

export const getProductWithOptions = async (menuItemId, restaurantId) => {
  const item = await menuRepository.getMenuItemWithOptions(
    menuItemId,
    restaurantId,
  );

  if (!item) {
    throw new AppError("Menu item not found.", 404);
  }

  return item;
};

export const getMenuItemsForCheckout = (
  menuItemIds,
  restaurantId,
  db,
) => menuRepository.getMenuItemsForCheckout(menuItemIds, restaurantId, db);
