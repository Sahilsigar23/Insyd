import dotenv from "dotenv";
import { createApp } from "./app.js";
import { initDb } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000 || 4321;
const app = createApp();

// Ensure schema exists, then start server
initDb().finally(() => {
  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
});

