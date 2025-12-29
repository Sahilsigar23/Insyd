"use client";

import useSWR from "swr";
import Link from "next/link";
import { fetcher, API_BASE_URL } from "../../lib/api";

export default function LowStockPage() {
  const { data, error } = useSWR(`${API_BASE_URL}/products?lowStock=true`, fetcher);

  if (error) return <div className="card card--error">Error loading low-stock items</div>;
  if (!data) return <div className="card">Loading...</div>;

  const products = data.data || [];

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Low-Stock Items</h2>
          <p className="page-subtitle">Products currently below their reorder threshold.</p>
        </div>
        <div className="page-actions">
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          {products.length === 0 ? (
            <p>No low-stock items right now.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.current_stock}</td>
                    <td>{p.reorder_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


