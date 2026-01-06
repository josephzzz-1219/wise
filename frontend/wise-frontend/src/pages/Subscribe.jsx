import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api";
import { useNavigate } from "react-router-dom";

export default function Subscribe() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState({});
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    setMsg("");
    apiGet("/products")
      .then((rows) => setProducts(Array.isArray(rows) ? rows : []))
      .catch((e) => setMsg("加载失败：" + String(e)));
  }, []);

  function toggle(sku) {
    setSelected((prev) => ({ ...prev, [sku]: !prev[sku] }));
  }

  const selectedCount = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]).length,
    [selected]
  );

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return products;
    return products.filter((p) => {
      const hay = `${p.sku_id} ${p.brand} ${p.name} ${p.spec} ${p.category}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [products, q]);

  async function save() {
    try {
      const sku_ids = Object.keys(selected).filter((k) => selected[k]);
      await apiPost("/watchlist", { user_id: "u1", sku_ids });
      nav("/daily");
    } catch (e) {
      setMsg("保存失败：" + String(e));
    }
  }

  return (
    <div className="container">
      <div className="page-title">Subscribe products</div>
      <div className="page-subtitle">
        Select items you care about. We will generate today’s pickup list and evidence cards.
      </div>

      <div className="searchbar">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by brand / name / spec / category..."
        />
        <span className="pill">{filtered.length} items</span>
        <button className="btn btn-primary" onClick={save} disabled={selectedCount === 0}>
          Save ({selectedCount})
        </button>
      </div>

      {msg && <div className="notice">{msg}</div>}

      <div className="grid">
        {filtered.map((p) => (
          <div key={p.sku_id} className="card">
            <div className="thumb">
              <span>IMG</span>
            </div>

            <div className="meta">
              <div className="name">
                {p.brand} {p.name} {p.spec}
              </div>
              <div className="sub">
                <span className="pill">{p.category || "Category"}</span>
                <span style={{ color: "var(--muted)" }}>SKU: {p.sku_id}</span>
              </div>
            </div>

            <div className="actions">
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!selected[p.sku_id]}
                  onChange={() => toggle(p.sku_id)}
                />
                <span style={{ fontWeight: 800 }}>Watch</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !msg && (
        <div className="notice">No products yet. (Mock mode should show demo items.)</div>
      )}
    </div>
  );
}
