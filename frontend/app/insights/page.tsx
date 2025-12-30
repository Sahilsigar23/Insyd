"use client";

import useSWR from "swr";
import Link from "next/link";
import { fetcher, API_BASE_URL } from "../../lib/api";

export default function InsightsPage() {
  const { data, error } = useSWR(`${API_BASE_URL}/insights/sku-performance`, fetcher);
  const {
    data: idleData,
    error: idleError
  } = useSWR(`${API_BASE_URL}/insights/idle-stock`, fetcher);
  const {
    data: damageData,
    error: damageError
  } = useSWR(`${API_BASE_URL}/insights/damage-summary`, fetcher);

  if (error || idleError || damageError) {
    return <div className="card card--error">Error loading insights</div>;
  }
  if (!data || !idleData || !damageData) {
    return <div className="card">Loading...</div>;
  }

  const { fastMoving, slowMoving, windowDays, fastMovingThreshold } = data;
  const { items: idleItems, idleDays } = idleData;
  const { items: damageItems, windowDays: damageWindowDays } = damageData;

  const totalFast = fastMoving.length;
  const totalSlow = slowMoving.length;
  const totalIdle = idleItems.length;
  const totalDamagedUnits = damageItems.reduce(
    (sum: number, item: any) => sum + (Number(item.totalDamaged) || 0),
    0
  );

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">SKU Insights</h2>
          <p className="page-subtitle">
            See what&apos;s selling, what&apos;s stuck on shelves, and what&apos;s getting damaged.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Fast-moving SKUs</div>
          <div className="kpi-value">{totalFast}</div>
          <div className="kpi-caption">
            Sold ≥ {fastMovingThreshold} units in the last {windowDays} days
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Slow-moving SKUs</div>
          <div className="kpi-value">{totalSlow}</div>
          <div className="kpi-caption">Below fast-mover threshold in the same window</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Idle / Dead Stock</div>
          <div className="kpi-value">{totalIdle}</div>
          <div className="kpi-caption">SKUs with stock but no sale in {idleDays}+ days</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Units Lost to Damage</div>
          <div className="kpi-value">{totalDamagedUnits}</div>
          <div className="kpi-caption">Across all SKUs in the last {damageWindowDays} days</div>
        </div>
      </div>

      <div className="insights-grid">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Fast-moving SKUs</h3>
            <p className="card__subtitle">
              Sold ≥ {fastMovingThreshold} units in the last {windowDays} days.
            </p>
          </div>
          <div className="card__body">
            {fastMoving.length === 0 ? (
              <div className="empty-state">
                <p>No fast-moving SKUs yet.</p>
              </div>
            ) : (
              <ul className="list">
                {fastMoving.map((item: any) => (
                  <li key={item.productId} className="list-item">
                    <span className="list-item__title">
                      {item.sku} – {item.name}
                    </span>
                    <span className="list-item__meta">
                      Sold = <strong className="list-item__number">{item.totalSold}</strong>
                    </span>
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
              <div className="empty-state">
                <p>No slow-moving SKUs.</p>
              </div>
            ) : (
              <ul className="list">
                {slowMoving.map((item: any) => (
                  <li key={item.productId} className="list-item">
                    <span className="list-item__title">
                      {item.sku} – {item.name}
                    </span>
                    <span className="list-item__meta">
                      Sold = <strong className="list-item__number">{item.totalSold}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Idle / Dead Stock</h3>
            <p className="card__subtitle">
              SKUs with stock on hand but no sale in the last {idleDays} days.
            </p>
          </div>
          <div className="card__body">
            {idleItems.length === 0 ? (
              <div className="empty-state">
                <p>No idle inventory right now.</p>
              </div>
            ) : (
              <ul className="list">
                {idleItems.map((item: any) => (
                  <li key={item.productId} className="list-item">
                    <span className="list-item__title">
                      {item.sku} – {item.name}
                    </span>
                    <span className="list-item__meta">
                      Stock = <strong className="list-item__number">{item.currentStock}</strong>
                      {item.lastSaleAt && (
                        <> • Last sale on {new Date(item.lastSaleAt).toLocaleDateString()}</>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Damage Summary</h3>
            <p className="card__subtitle">
              Units lost to damage in the last {damageWindowDays} days (by SKU).
            </p>
          </div>
          <div className="card__body">
            {damageItems.length === 0 ? (
              <div className="empty-state">
                <p>No damage recorded in this period.</p>
              </div>
            ) : (
              <ul className="list">
                {damageItems.map((item: any) => (
                  <li key={item.productId} className="list-item">
                    <span className="list-item__title">
                      {item.sku} – {item.name}
                    </span>
                    <span className="list-item__meta">
                      Damaged = <strong className="list-item__number">{item.totalDamaged}</strong>
                    </span>
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

