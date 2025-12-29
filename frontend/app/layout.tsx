import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Insyd Inventory Dashboard",
  description: "Inventory visibility for material businesses"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="app-body">
        <div className="app-shell">
          <aside className="app-sidebar">
            <div className="app-sidebar__brand">
              <span className="app-sidebar__logo">Insyd</span>
              <span className="app-sidebar__subtitle">Inventory</span>
            </div>
            <nav className="app-sidebar__nav">
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link href="/products/new" className="nav-link">
                Add Product
              </Link>
              <Link href="/low-stock" className="nav-link">
                Low-Stock View
              </Link>
              <Link href="/insights" className="nav-link">
                Insights
              </Link>
            </nav>
          </aside>
          <main className="app-main">
            <header className="app-topbar">
              <div>
                <h1 className="app-topbar__title">Inventory Dashboard</h1>
                <p className="app-topbar__subtitle">
                  Live stock, low-stock alerts, and basic SKU insights for material businesses.
                </p>
              </div>
            </header>
            <section className="app-content">{children}</section>
          </main>
        </div>
      </body>
    </html>
  );
}

