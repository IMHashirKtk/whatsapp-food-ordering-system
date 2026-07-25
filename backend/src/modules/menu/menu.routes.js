import { Router } from "express";

import categoryRoutes from "./category/category.routes.js";
import itemRoutes from "./item/item.routes.js";
import optionGroupRoutes from "./option-group/option-group.routes.js";
import optionRoutes from "./option/option.routes.js";

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

export default router;
