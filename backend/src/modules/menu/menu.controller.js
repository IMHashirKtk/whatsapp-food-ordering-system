import * as menuService from "./menu.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

/* ==========================
   Categories
========================== */

export const createCategory = asyncHandler(async (req, res) => {
  const category = await menuService.createCategory(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully.",
    data: category,
  });
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await menuService.getAllCategories();

  res.json({
    success: true,
    data: categories,
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await menuService.getCategoryById(req.params.id);

  res.json({
    success: true,
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await menuService.updateCategory(req.params.id, req.body);

  res.json({
    success: true,
    message: "Category updated successfully.",
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await menuService.deleteCategory(req.params.id);

  res.json({
    success: true,
    message: "Category deleted successfully.",
  });
});

/* ==========================
   Menu Items
========================== */

export const createMenuItem = asyncHandler(async (req, res) => {
  const item = await menuService.createMenuItem(req.body);

  res.status(201).json({
    success: true,
    message: "Menu item created successfully.",
    data: item,
  });
});

export const getAllMenuItems = asyncHandler(async (req, res) => {
  const items = await menuService.getAllMenuItems();

  res.json({
    success: true,
    data: items,
  });
});

export const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await menuService.getMenuItemById(req.params.id);

  res.json({
    success: true,
    data: item,
  });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await menuService.updateMenuItem(req.params.id, req.body);

  res.json({
    success: true,
    message: "Menu item updated successfully.",
    data: item,
  });
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  await menuService.deleteMenuItem(req.params.id);

  res.json({
    success: true,
    message: "Menu item deleted successfully.",
  });
});

/* ==========================
   Option Groups
========================== */

export const createOptionGroup = asyncHandler(async (req, res) => {
  const group = await menuService.createOptionGroup(req.body);

  res.status(201).json({
    success: true,
    message: "Option group created successfully.",
    data: group,
  });
});

export const getOptionGroups = asyncHandler(async (req, res) => {
  const groups = await menuService.getOptionGroups(req.params.menuItemId);

  res.json({
    success: true,
    data: groups,
  });
});

export const updateOptionGroup = asyncHandler(async (req, res) => {
  const group = await menuService.updateOptionGroup(req.params.id, req.body);

  res.json({
    success: true,
    message: "Option group updated successfully.",
    data: group,
  });
});

export const deleteOptionGroup = asyncHandler(async (req, res) => {
  await menuService.deleteOptionGroup(req.params.id);

  res.json({
    success: true,
    message: "Option group deleted successfully.",
  });
});

/* ==========================
   Options
========================== */

export const createOption = asyncHandler(async (req, res) => {
  const option = await menuService.createOption(req.body);

  res.status(201).json({
    success: true,
    message: "Option created successfully.",
    data: option,
  });
});

export const getOptions = asyncHandler(async (req, res) => {
  const options = await menuService.getOptions(req.params.optionGroupId);

  res.json({
    success: true,
    data: options,
  });
});

export const updateOption = asyncHandler(async (req, res) => {
  const option = await menuService.updateOption(req.params.id, req.body);

  res.json({
    success: true,
    message: "Option updated successfully.",
    data: option,
  });
});

export const deleteOption = asyncHandler(async (req, res) => {
  await menuService.deleteOption(req.params.id);

  res.json({
    success: true,
    message: "Option deleted successfully.",
  });
});

/* ==========================
   Menu Tree
========================== */

export const getMenuTree = asyncHandler(async (req, res) => {
  const menu = await menuService.getMenuTree();

  res.json({
    success: true,
    data: menu,
  });
});

export const getOptionGroupById = asyncHandler(async (req, res) => {
  const group = await menuService.getOptionGroupById(req.params.id);

  res.json({
    success: true,
    data: group,
  });
});

export const getOptionById = asyncHandler(async (req, res) => {
  const option = await menuService.getOptionById(req.params.id);

  res.json({
    success: true,
    data: option,
  });
});
