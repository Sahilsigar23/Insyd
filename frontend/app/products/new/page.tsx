"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    unit: "",
    current_stock: 0,
    reorder_threshold: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "current_stock" || name === "reorder_threshold" ? Number(value) : value
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create product");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack page-stack--narrow">
      <div className="page-header">
        <div>
          <h2 className="page-title">Add New Product</h2>
          <p className="page-subtitle">Create a SKU and define its stock and reorder threshold.</p>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <form onSubmit={onSubmit} className="form-grid">
            <div className="form-field">
              <label htmlFor="sku">SKU</label>
              <input id="sku" name="sku" placeholder="e.g. TILE-001" value={form.sku} onChange={onChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" placeholder="Product name" value={form.name} onChange={onChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" placeholder="Tiles, Laminates, Cement..." value={form.category} onChange={onChange} />
            </div>
            <div className="form-field">
              <label htmlFor="unit">Unit</label>
              <input id="unit" name="unit" placeholder="BOX / BAG / SHEET" value={form.unit} onChange={onChange} />
            </div>
            <div className="form-field">
              <label htmlFor="current_stock">Initial stock</label>
              <input
                id="current_stock"
                name="current_stock"
                type="number"
                placeholder="0"
                value={form.current_stock}
                onChange={onChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="reorder_threshold">Reorder threshold</label>
              <input
                id="reorder_threshold"
                name="reorder_threshold"
                type="number"
                placeholder="e.g. 20"
                value={form.reorder_threshold}
                onChange={onChange}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


