"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../../lib/api";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    unit: "",
    current_stock: 0,
    reorder_threshold: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load product");
        }
        const data = await res.json();
        setForm({
          sku: data.sku,
          name: data.name,
          category: data.category || "",
          unit: data.unit || "",
          current_stock: data.current_stock ?? 0,
          reorder_threshold: data.reorder_threshold ?? 0
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "current_stock" || name === "reorder_threshold" ? Number(value) : value
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          unit: form.unit,
          reorder_threshold: form.reorder_threshold
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update product");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card">Loading product...</div>;
  }

  return (
    <div className="page-stack page-stack--narrow">
      <div className="page-header">
        <div>
          <h2 className="page-title">Edit Product</h2>
          <p className="page-subtitle">Update product details and reorder threshold.</p>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <form onSubmit={onSubmit} className="form-grid">
            <div className="form-field">
              <label htmlFor="sku">SKU (read-only)</label>
              <input id="sku" name="sku" value={form.sku} disabled />
            </div>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" value={form.category} onChange={onChange} />
            </div>
            <div className="form-field">
              <label htmlFor="unit">Unit</label>
              <input id="unit" name="unit" value={form.unit} onChange={onChange} />
            </div>
            <div className="form-field">
              <label htmlFor="reorder_threshold">Reorder threshold</label>
              <input
                id="reorder_threshold"
                name="reorder_threshold"
                type="number"
                value={form.reorder_threshold}
                onChange={onChange}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


