import { Router } from "express";

import categoryRoutes from "./category/category.routes.js";
import itemRoutes from "./item/item.routes.js";
import optionGroupRoutes from "./option-group/option-group.routes.js";
import optionRoutes from "./option/option.routes.js";

import * as menuController from "./menu.controller.js";

const router = Router();

/* ==========================
   Categories
========================== */

router.use("/categories", categoryRoutes);

/* ==========================
   Menu Items
========================== */

router.use("/items", itemRoutes);

/* ==========================
   Option Groups
========================== */

router.use("/option-groups", optionGroupRoutes);

/* ==========================
   Options
========================== */

router.use("/options", optionRoutes);

/* ==========================
   Complete Menu Tree
========================== */

router.get("/tree", menuController.getMenuTree);

export default router;
