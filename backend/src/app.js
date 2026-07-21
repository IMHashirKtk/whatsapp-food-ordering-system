import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import customerRoutes from "./routes/customer.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import metaRoutes from "./modules/meta/meta.routes.js";

const app = express();

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors());

// Request logging
app.use(morgan("dev"));

// Parse JSON requests
app.use(express.json());

// Health check route
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/meta", metaRoutes);

// 404 Handler (must be after all routes)
app.use(notFound);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
