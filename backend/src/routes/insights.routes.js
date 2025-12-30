import express from "express";
import { query } from "../config/db.js";

export const insightsRouter = express.Router();

// GET /insights/sku-performance?windowDays=30
// Fast vs slow moving SKUs based on quantities sold in a recent window.
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

// GET /insights/idle-stock?idleDays=90
// Identifies SKUs that have not had a sale in the last N days,
// surfacing "dead" or idle inventory that locks up capital.
insightsRouter.get("/idle-stock", async (req, res, next) => {
  try {
    const idleDays = Number(req.query.idleDays || 90);

    const sql = `
      WITH last_sales AS (
        SELECT
          sm.product_id,
          MAX(CASE WHEN sm.type = 'SALE' THEN sm.created_at ELSE NULL END) AS last_sale_at
        FROM stock_movements sm
        GROUP BY sm.product_id
      )
      SELECT
        p.id AS product_id,
        p.sku,
        p.name,
        p.category,
        p.current_stock,
        COALESCE(ls.last_sale_at, p.created_at) AS last_sale_at
      FROM products p
      LEFT JOIN last_sales ls ON ls.product_id = p.id
      WHERE p.current_stock > 0
        AND (
          COALESCE(ls.last_sale_at, p.created_at) < NOW() - INTERVAL '${idleDays} days'
        )
      ORDER BY last_sale_at NULLS FIRST, p.current_stock DESC;
    `;

    const result = await query(sql);

    const items = result.rows.map((row) => ({
      productId: row.product_id,
      sku: row.sku,
      name: row.name,
      category: row.category,
      currentStock: Number(row.current_stock) || 0,
      lastSaleAt: row.last_sale_at
    }));

    res.json({
      idleDays,
      items
    });
  } catch (err) {
    next(err);
  }
});

// GET /insights/damage-summary?windowDays=90
// Summarises stock lost to DAMAGE movements in a time window.
insightsRouter.get("/damage-summary", async (req, res, next) => {
  try {
    const windowDays = Number(req.query.windowDays || 90);

    const sql = `
      SELECT
        p.id AS product_id,
        p.sku,
        p.name,
        COALESCE(SUM(CASE WHEN sm.type = 'DAMAGE' THEN sm.quantity ELSE 0 END), 0) AS total_damaged,
        MIN(CASE WHEN sm.type = 'DAMAGE' THEN sm.created_at ELSE NULL END) AS first_damage_at,
        MAX(CASE WHEN sm.type = 'DAMAGE' THEN sm.created_at ELSE NULL END) AS last_damage_at
      FROM products p
      LEFT JOIN stock_movements sm
        ON sm.product_id = p.id
       AND sm.created_at >= NOW() - INTERVAL '${windowDays} days'
      GROUP BY p.id, p.sku, p.name
      HAVING COALESCE(SUM(CASE WHEN sm.type = 'DAMAGE' THEN sm.quantity ELSE 0 END), 0) > 0
      ORDER BY total_damaged DESC;
    `;

    const result = await query(sql);

    const items = result.rows.map((row) => ({
      productId: row.product_id,
      sku: row.sku,
      name: row.name,
      totalDamaged: Number(row.total_damaged) || 0,
      firstDamageAt: row.first_damage_at,
      lastDamageAt: row.last_damage_at
    }));

    res.json({
      windowDays,
      items
    });
  } catch (err) {
    next(err);
  }
});

