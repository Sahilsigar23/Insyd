import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import { productsRouter } from "./routes/products.routes.js";
import { stockMovementsRouter } from "./routes/stockMovements.routes.js";
import { insightsRouter } from "./routes/insights.routes.js";

dotenv.config();

export const createApp = () => {
  const app = express();

  // CORS: allow comma-separated list of origins or "*" for all
  const corsOriginEnv = process.env.CORS_ORIGIN || "*";
  const allowedOrigins = corsOriginEnv.split(",").map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow same-origin / curl
        if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/products", productsRouter);
  app.use("/stock-movements", stockMovementsRouter);
  app.use("/insights", insightsRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error"
    });
  });

  return app;
};


