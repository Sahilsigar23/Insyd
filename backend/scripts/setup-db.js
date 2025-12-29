import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  try {
    console.log("Connecting to database...");
    
    // Read the schema file
    const schemaPath = path.join(__dirname, "../sql/schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");
    
    console.log("Running schema.sql...");
    
    // Execute the schema
    await pool.query(schemaSQL);
    
    console.log("✅ Database schema created successfully!");
    
    // Test query to verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('products', 'stock_movements')
      ORDER BY table_name;
    `);
    
    console.log("\n📊 Tables created:");
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();

