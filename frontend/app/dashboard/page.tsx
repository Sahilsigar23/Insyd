"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher, API_BASE_URL } from "../../lib/api";

type MovementMode = "SALE" | "PURCHASE" | "DAMAGE" | null;

export default function DashboardPage() {
  const { data, error, mutate } = useSWR(`${API_BASE_URL}/products`, fetcher);
  const [movementMode, setMovementMode] = useState<MovementMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [damageReason, setDamageReason] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [movementError, setMovementError] = useState<string | null>(null);

  if (error) return <div className="card card--error">Error loading products</div>;
  if (!data) return <div className="card">Loading...</div>;

  const products = data.data || [];

  const openMovement = (product: any, mode: MovementMode) => {
    setSelectedProduct(product);
    setMovementMode(mode);
    setQuantity(1);
    setDamageReason("");
    setMovementError(null);
  };

  const closeMovement = () => {
    setMovementMode(null);
    setSelectedProduct(null);
    setDamageReason("");
    setMovementError(null);
  };

  const onSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !movementMode) return;
    if (quantity <= 0) {
      setMovementError("Quantity must be greater than 0");
      return;
    }
    setSaving(true);
    setMovementError(null);
    try {
      const body: any = {
        productId: selectedProduct.id,
        type: movementMode,
        quantity
      };
      
      // Add note for damage with reason
      if (movementMode === "DAMAGE" && damageReason.trim()) {
        body.note = `Damage reason: ${damageReason.trim()}`;
      }
      
      const res = await fetch(`${API_BASE_URL}/stock-movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to record movement");
      }
      await mutate(); // refresh products
      closeMovement();
    } catch (err: any) {
      setMovementError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory Overview</h2>
          <p className="page-subtitle">All SKUs with current stock and low-stock status.</p>
        </div>
        <div className="page-actions">
          <Link href="/products/new" className="btn btn-primary">
            + Add Product
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.current_stock}</td>
                  <td>{p.reorder_threshold}</td>
                  <td>
                    {p.current_stock < p.reorder_threshold ? (
                      <span className="badge badge--danger">Low</span>
                    ) : (
                      <span className="badge badge--success">OK</span>
                    )}
                  </td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => openMovement(p, "SALE")}
                    >
                      Sale
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => openMovement(p, "PURCHASE")}
                    >
                      Purchase
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => openMovement(p, "DAMAGE")}
                    >
                      Damage
                    </button>
                    <Link href={`/products/${p.id}/edit`} className="btn btn-secondary btn-xs">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {movementMode && selectedProduct && (
        <div className="modal-backdrop" onClick={closeMovement}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">
                Record {movementMode === "SALE" ? "Sale" : movementMode === "PURCHASE" ? "Purchase" : "Damage"} – {selectedProduct.sku}
              </h3>
            </div>
            <div className="modal__body">
              <p className="modal__subtitle">
                Current stock: {selectedProduct.current_stock} • Threshold: {selectedProduct.reorder_threshold}
              </p>
              <form onSubmit={onSubmitMovement} className="form-grid">
                <div className="form-field">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                {movementMode === "DAMAGE" && (
                  <div className="form-field">
                    <label htmlFor="damageReason">Damage Reason</label>
                    <select
                      id="damageReason"
                      name="damageReason"
                      value={damageReason}
                      onChange={(e) => setDamageReason(e.target.value)}
                      required
                    >
                      <option value="">Select reason...</option>
                      <option value="Expired">Expired</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Broken">Broken</option>
                      <option value="Defective">Defective</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
                {movementError && <p className="form-error">{movementError}</p>}
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeMovement}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

