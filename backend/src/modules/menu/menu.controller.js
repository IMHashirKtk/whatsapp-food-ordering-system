import * as menuService from "./menu.service.js";
import asyncHandler from "../../utils/async-handler.js";

/* ==========================
   Categories
========================== */

export const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await menuService.getActiveCategories(
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: categories,
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await menuService.getCategoryById(
    req.params.id,
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: category,
  });
});

/* ==========================
   Menu Items
========================== */

export const getMenuItemsByCategory = asyncHandler(async (req, res) => {
  const items = await menuService.getMenuItemsByCategory(
    req.params.categoryId,
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: items,
  });
});

export const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await menuService.getMenuItemById(
    req.params.id,
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: item,
  });
});

export const getProductWithOptions = asyncHandler(async (req, res) => {
  const item = await menuService.getProductWithOptions(
    req.params.id,
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: item,
  });
});
