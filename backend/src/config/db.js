import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from backend/.env
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Please define it in backend/.env");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
});

export const query = (text, params) => pool.query(text, params);

// Ensure required tables exist (safe to run on every startup)
export const initDb = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // db.js is in src/config, schema.sql is in backend/sql
    const schemaPath = path.join(__dirname, "../../sql/schema.sql");

    if (!fs.existsSync(schemaPath)) {
      console.warn("schema.sql not found, skipping automatic DB init");
      return;
    }

    const sql = fs.readFileSync(schemaPath, "utf8");
    await pool.query(sql);
    console.log("Database schema ensured (products, stock_movements).");
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
};

