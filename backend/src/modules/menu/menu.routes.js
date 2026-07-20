import { Router } from "express";
import validate from "../../middleware/validate.js";

import * as menuController from "./menu.controller.js";

import {
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createOptionGroupSchema,
  updateOptionGroupSchema,
  createOptionSchema,
  updateOptionSchema,
  idSchema,
  menuItemIdSchema,
  optionGroupIdSchema,
} from "./menu.validation.js";

const router = Router();

/* ==========================
   Categories
========================== */

router.post(
  "/categories",
  validate(createCategorySchema),
  menuController.createCategory,
);

router.get("/categories", menuController.getAllCategories);

router.get(
  "/categories/:id",
  validate(idSchema),
  menuController.getCategoryById,
);

router.put(
  "/categories/:id",
  validate(idSchema),
  validate(updateCategorySchema),
  menuController.updateCategory,
);

router.delete(
  "/categories/:id",
  validate(idSchema),
  menuController.deleteCategory,
);

/* ==========================
   Menu Items
========================== */

router.post(
  "/items",
  validate(createMenuItemSchema),
  menuController.createMenuItem,
);

router.get("/items", menuController.getAllMenuItems);

router.get("/items/:id", validate(idSchema), menuController.getMenuItemById);

router.put(
  "/items/:id",
  validate(idSchema),
  validate(updateMenuItemSchema),
  menuController.updateMenuItem,
);

router.delete("/items/:id", validate(idSchema), menuController.deleteMenuItem);

/* ==========================
   Option Groups
========================== */

router.post(
  "/option-groups",
  validate(createOptionGroupSchema),
  menuController.createOptionGroup,
);

router.get(
  "/items/:menuItemId/option-groups",
  validate(menuItemIdSchema),
  menuController.getOptionGroups,
);

router.get(
  "/option-groups/:id",
  validate(idSchema),
  menuController.getOptionGroupById,
);

router.put(
  "/option-groups/:id",
  validate(idSchema),
  validate(updateOptionGroupSchema),
  menuController.updateOptionGroup,
);

router.delete(
  "/option-groups/:id",
  validate(idSchema),
  menuController.deleteOptionGroup,
);

/* ==========================
   Options
========================== */

router.post(
  "/options",
  validate(createOptionSchema),
  menuController.createOption,
);

router.get(
  "/option-groups/:optionGroupId/options",
  validate(optionGroupIdSchema),
  menuController.getOptions,
);

router.get("/options/:id", validate(idSchema), menuController.getOptionById);

router.put(
  "/options/:id",
  validate(idSchema),
  validate(updateOptionSchema),
  menuController.updateOption,
);

router.delete("/options/:id", validate(idSchema), menuController.deleteOption);

/* ==========================
   Complete Menu Tree
========================== */

router.get("/tree", menuController.getMenuTree);

export default router;
