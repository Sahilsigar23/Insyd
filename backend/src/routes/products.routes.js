import express from "express";
import { query } from "../config/db.js";

export const productsRouter = express.Router();

// GET /products
productsRouter.get("/", async (req, res, next) => {
  try {
    const { lowStock } = req.query;
    let sql = "SELECT * FROM products";
    const params = [];
    if (lowStock === "true") {
      sql += " WHERE current_stock < reorder_threshold";
    }
    sql += " ORDER BY created_at DESC";
    const result = await query(sql, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /products/:id
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM products WHERE id = $1", [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /products
productsRouter.post("/", async (req, res, next) => {
  try {
    const { sku, name, category, unit, current_stock = 0, reorder_threshold = 0 } = req.body;
    if (!sku || !name) {
      return res.status(400).json({ error: "sku and name are required" });
    }
    const result = await query(
      `INSERT INTO products (sku, name, category, unit, current_stock, reorder_threshold)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [sku, name, category, unit, current_stock, reorder_threshold]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /products/:id
productsRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, unit, reorder_threshold } = req.body;
    const result = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           unit = COALESCE($3, unit),
           reorder_threshold = COALESCE($4, reorder_threshold),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, category, unit, reorder_threshold, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /products/:id
productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM stock_movements WHERE product_id = $1", [id]);
    const result = await query("DELETE FROM products WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


