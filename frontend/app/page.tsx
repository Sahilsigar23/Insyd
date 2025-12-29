import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">Welcome to Insyd Inventory</h2>
        <p className="card__subtitle">
          Use the quick links below to jump into your daily workflows.
        </p>
      </div>
      <div className="card__body">
        <div className="quick-links">
          <Link href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/products/new" className="btn btn-secondary">
            Add New Product
          </Link>
          <Link href="/low-stock" className="btn btn-ghost">
            Review Low-Stock Items
          </Link>
          <Link href="/insights" className="btn btn-ghost">
            View SKU Insights
          </Link>
        </div>
      </div>
    </div>
  );
}

