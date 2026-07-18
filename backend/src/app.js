import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

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

// 404 Handler (must be after all routes)
app.use(notFound);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
