# Database Setup Guide

## Quick Setup (No psql Required)

Since `psql` is not installed on Windows, use this Node.js script instead:

### Step 1: Create `.env` file

Create a `.env` file in the `backend` folder with your database connection:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/neondb?sslmode=require
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

**Replace:**
- `YOUR_PASSWORD` with your actual Neon database password
- `YOUR_HOST` with your actual Neon host (e.g., `ep-xxx-xxx.us-east-2.aws.neon.tech`)

### Step 2: Run the setup script

```powershell
npm run setup-db
```

This will:
- Connect to your database
- Create the `products` and `stock_movements` tables
- Show you a confirmation message

### Alternative: Manual Setup via Neon Dashboard

If you prefer, you can also run the SQL manually:

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `sql/schema.sql`
4. Run it

---

## Troubleshooting

**Error: "Cannot find module 'dotenv'"**
- Run: `npm install`

**Error: "Connection refused"**
- Check your `DATABASE_URL` in `.env`
- Make sure your Neon database is running
- Verify the password and host are correct

**Error: "relation already exists"**
- The tables already exist. This is fine - the script uses `CREATE TABLE IF NOT EXISTS`

