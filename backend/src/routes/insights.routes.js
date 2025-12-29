import express from "express";
import { query } from "../config/db.js";

export const insightsRouter = express.Router();

// GET /insights/sku-performance?windowDays=30
insightsRouter.get("/sku-performance", async (req, res, next) => {
  try {
    const windowDays = Number(req.query.windowDays || 30);
    const fastMovingThreshold = Number(req.query.fastThreshold || 50);

    const sql = `
      SELECT
        p.id as product_id,
        p.sku,
        p.name,
        COALESCE(SUM(CASE WHEN sm.type = 'SALE' THEN sm.quantity ELSE 0 END), 0) as total_sold,
        COALESCE(SUM(CASE WHEN sm.type = 'PURCHASE' THEN sm.quantity ELSE 0 END), 0) as total_purchased,
        MAX(CASE WHEN sm.type = 'SALE' THEN sm.created_at ELSE NULL END) as last_sale_at
      FROM products p
      LEFT JOIN stock_movements sm
        ON sm.product_id = p.id
       AND sm.created_at >= NOW() - INTERVAL '${windowDays} days'
      GROUP BY p.id, p.sku, p.name
      ORDER BY total_sold DESC;
    `;

    const result = await query(sql);
    const fastMoving = [];
    const slowMoving = [];

    for (const row of result.rows) {
      const item = {
        productId: row.product_id,
        sku: row.sku,
        name: row.name,
        totalSold: Number(row.total_sold) || 0,
        totalPurchased: Number(row.total_purchased) || 0,
        lastSaleAt: row.last_sale_at
      };
      if (item.totalSold >= fastMovingThreshold) {
        fastMoving.push(item);
      } else {
        slowMoving.push(item);
      }
    }

    res.json({
      windowDays,
      fastMovingThreshold,
      fastMoving,
      slowMoving
    });
  } catch (err) {
    next(err);
  }
});


