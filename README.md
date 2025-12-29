 (Next.js + Express + Postgres)

It focuses on **inventory visibility** for Indian material businesses (tiles, laminates, cement, lighting, etc.).

The solution provides:

- **Inventory dashboard** – Live view of all products with current stock and low-stock flags.
- **Product management** – Add, edit, delete SKUs.
- **Stock movements** – Record purchases and sales; stock auto-updates.
- **Low-stock view** – Dedicated page for SKUs below their reorder threshold.
- **SKU insights** – Fast-moving vs slow-moving SKUs over a time window.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, SWR
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (tested with Neon)
- **Deployment**:

---

## Project Structure

```text
Insyd/
  backend/        # Express API + Postgres
  frontend/       # Next.js dashboard
```

### Backend (`backend/`)

- `src/app.js` – Express app, routes, CORS setup.
- `src/server.js` – Server bootstrap, DB init.
- `src/config/db.js` – Postgres connection + schema bootstrapping.
- `src/routes/products.routes.js` – Product CRUD and fetch-by-id.
- `src/routes/stockMovements.routes.js` – Purchases/sales + stock updates.
- `src/routes/insights.routes.js` – Fast/slow moving SKUs.
- `sql/schema.sql` – DB schema for `products` and `stock_movements`.

### Frontend (`frontend/`)

- `app/layout.tsx` – App shell (sidebar, topbar, layout).
- `app/page.tsx` – Welcome / quick links.
- `app/dashboard/page.tsx` – Inventory dashboard with **Sale/Purchase/Edit** actions.
- `app/products/new/page.tsx` – Add product.
- `app/products/[id]/edit/page.tsx` – Edit product.
- `app/low-stock/page.tsx` – Low-stock view.
- `app/insights/page.tsx` – SKU insights.
- `lib/api.ts` – API base URL + fetch helper.
- `app/globals.css` – Design system (cards, buttons, tables, modal, layout).

---

## Running Locally

### 1. Backend – Environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/neondb?sslmode=require&channel_binding=require
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

> Replace `YOUR_PASSWORD` and `YOUR_HOST` with your Postgres/Neon connection string.

Install dependencies and start the server:

```bash
cd backend
npm install
npm run dev
```

The DB schema is automatically ensured on startup using `sql/schema.sql`.

### 2. Frontend – Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Install dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Key Features

### Inventory Dashboard

- Lists all products with **SKU, name, category, stock, threshold, low-stock status**.
- **Actions per row**:
  - **Sale** – records a sale movement and decreases stock.
  - **Purchase** – records a purchase movement and increases stock.
  - **Edit** – opens product edit page.

### Product Management

- **Add Product**: `/products/new`
  - Fields: SKU, name, category, unit, initial stock, reorder threshold.
- **Edit Product**: `/products/[id]/edit`
  - Updates: name, category, unit, reorder threshold.
- **Delete Product**: via API (`DELETE /products/:id`) – can be wired to UI if needed.

### Stock Update Logic

- API: `POST /stock-movements`

  ```json
  {
    "productId": 1,
    "type": "SALE",        // or "PURCHASE"
    "quantity": 5
  }
  ```

- Behavior:
  - `PURCHASE`: `current_stock += quantity`
  - `SALE`: `current_stock -= quantity` (validated to never go below 0)
  - After each movement:
    - `is_low_stock` is recalculated using `current_stock < reorder_threshold`.

### Low-Stock Alerts

- Low-stock is derived per product; no separate alerts table needed.
- Low-stock view: `GET /products?lowStock=true` and `/low-stock` page.

### SKU Insights

- API: `GET /insights/sku-performance?windowDays=30&fastThreshold=50`
- Aggregates `stock_movements` to compute:
  - `total_sold` and `total_purchased` per SKU.
  - Fast-moving SKUs (≥ threshold).
  - Slow-moving SKUs (below threshold).

---

## Deployment

### Backend on Render

1. Push repo to GitHub.
2. Create a new **Web Service** on Render pointing to `backend/`.
3. Set environment variables:

   ```text
   DATABASE_URL=postgresql://...    # from Neon / Postgres provider
   PORT=4000                        # or let Render set PORT, and read it in server
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

4. Build command:

   ```bash
   npm install
   ```

5. Start command:

   ```bash
   npm run start
   ```

### Frontend on Vercel

1. Import the GitHub repo into Vercel (root = `frontend/`).
2. Set environment variable:

   ```text
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-service.onrender.com
   ```

3. Deploy – Vercel will build the Next.js app and use the backend URL for API calls.

---

## Explaining This Project in an Interview

- **Problem**: “Many small/medium material businesses in India don’t have real-time visibility into stock levels.
  They only see shortages after they lose a sale or over-order.”
- **Solution**: “I built a full-stack inventory visibility system with a live dashboard, low-stock alerts,
  and SKU insights. It models purchases and sales as movements on top of a Postgres database, with a clean API
  and a professional dashboard UI.”
- **Architecture**:
  - Next.js frontend (App Router) for fast navigation and modern UX.
  - Express backend with a simple, layered structure (routes → services → DB).
  - Postgres as system of record with a normalized schema plus a denormalized `current_stock` column for fast reads.
- **Trade-offs**:
  - Single backend service (monolith) for simplicity; no microservices or queues.
  - Derived `is_low_stock` field for cheap filtering vs recomputing on every read.
  - Straightforward REST instead of GraphQL for clarity in an assignment context.

This README is intentionally concise but complete enough for a reviewer to understand,
run, and evaluate the project quickly.


