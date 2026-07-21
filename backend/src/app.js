import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import customerRoutes from "./modules/customer/customer.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import metaRoutes from "./modules/meta/meta.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";
import { swaggerUi, specs } from "./config/swagger.js";

const app = express();

/* ==========================================
   Global Middleware
========================================== */

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use("/uploads", express.static(path.resolve("uploads")));

/* ==========================================
   API Routes
========================================== */

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/customers", customerRoutes);

app.use("/api/v1/menu", menuRoutes);

app.use("/api/v1/cart", cartRoutes);

app.use("/api/v1/orders", orderRoutes);

app.use("/api/v1/meta", metaRoutes);

app.use("/api/v1/dashboard", dashboardRoutes);

app.use("/api/v1/upload", uploadRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

/* ==========================================
   404 Handler
========================================== */

app.use(notFound);

/* ==========================================
   Global Error Handler
========================================== */

app.use(errorHandler);

export default app;
