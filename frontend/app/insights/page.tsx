"use client";

import useSWR from "swr";
import Link from "next/link";
import { fetcher, API_BASE_URL } from "../../lib/api";

export default function InsightsPage() {
  const { data, error } = useSWR(`${API_BASE_URL}/insights/sku-performance`, fetcher);

  if (error) return <div className="card card--error">Error loading insights</div>;
  if (!data) return <div className="card">Loading...</div>;

  const { fastMoving, slowMoving, windowDays, fastMovingThreshold } = data;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">SKU Insights</h2>
          <p className="page-subtitle">
            Fast-moving vs slow-moving products over the last {windowDays} days.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="insights-grid">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Fast-moving SKUs</h3>
            <p className="card__subtitle">Sold ≥ {fastMovingThreshold} units in the selected window.</p>
          </div>
          <div className="card__body">
            {fastMoving.length === 0 ? (
              <p>No fast-moving SKUs yet.</p>
            ) : (
              <ul className="list">
                {fastMoving.map((item: any) => (
                  <li key={item.productId} className="list-item">
                    <span className="list-item__title">
                      {item.sku} – {item.name}
                    </span>
                    <span className="list-item__meta">Sold {item.totalSold}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Slow-moving SKUs</h3>
            <p className="card__subtitle">Sold below threshold in the selected window.</p>
          </div>
          <div className="card__body">
            {slowMoving.length === 0 ? (
              <p>No slow-moving SKUs.</p>
            ) : (
              <ul className="list">
                {slowMoving.map((item: any) => (
                  <li key={item.productId} className="list-item">
                    <span className="list-item__title">
                      {item.sku} – {item.name}
                    </span>
                    <span className="list-item__meta">Sold {item.totalSold}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


