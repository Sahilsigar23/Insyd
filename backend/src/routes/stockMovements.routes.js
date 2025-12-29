import express from "express";
import { query } from "../config/db.js";

export const stockMovementsRouter = express.Router();

// POST /stock-movements
stockMovementsRouter.post("/", async (req, res, next) => {
  const client = await query("BEGIN").catch(() => null);
  try {
    const { productId, type, quantity, unitPrice, note } = req.body;
    if (!productId || !type || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "productId, type and positive quantity are required" });
    }
    if (!["PURCHASE", "SALE"].includes(type)) {
      return res.status(400).json({ error: "type must be PURCHASE or SALE" });
    }

    // Fetch current stock
    const productRes = await query("SELECT * FROM products WHERE id = $1", [productId]);
    const product = productRes.rows[0];
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let newStock = product.current_stock;
    if (type === "PURCHASE") {
      newStock += quantity;
    } else {
      if (product.current_stock - quantity < 0) {
        return res.status(400).json({ error: "Sale quantity exceeds current stock" });
      }
      newStock -= quantity;
    }

    // Insert movement
    const movementRes = await query(
      `INSERT INTO stock_movements (product_id, type, quantity, unit_price, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [productId, type, quantity, unitPrice ?? null, note ?? null]
    );

    // Update product stock and low-stock flag
    const isLowStock = newStock < product.reorder_threshold;
    const updatedProductRes = await query(
      `UPDATE products
       SET current_stock = $1,
           is_low_stock = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [newStock, isLowStock, productId]
    );

    await query("COMMIT");

    res.status(201).json({
      movement: movementRes.rows[0],
      product: updatedProductRes.rows[0]
    });
  } catch (err) {
    try {
      await query("ROLLBACK");
    } catch {
      // ignore
    }
    next(err);
  }
});


