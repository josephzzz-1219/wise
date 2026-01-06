import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import { useAppStore } from "../store.jsx";

export default function Watchlist() {
  const { state, toggleWatch, clearWatch } = useAppStore();

  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");

  useEffect(() => {
    apiGet("/products")
      .then((rows) => setProducts(Array.isArray(rows) ? rows : []))
      .catch((e) => setErr(String(e)));
  }, []);

  const categories = useMemo(() => {
    const s = new Set(products.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(s)];
  }, [products]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "ALL" && (p.category || "") !== cat) return false;
      if (!kw) return true;
      const hay = `${p.brand} ${p.name} ${p.spec} ${p.category}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [products, q, cat]);

  return (
    <div className="container">
      <div className="page-title">Watchlist</div>
      <div className="page-subtitle">Choose items you want us to monitor and recommend daily.</div>

      <div className="searchbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand / name..." />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="btn">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="pill">{state.watchlist.length} watching</span>
        <button className="btn" onClick={clearWatch} disabled={state.watchlist.length === 0}>Clear</button>
      </div>

      {err && <div className="notice">Load failed: {err}</div>}

      {state.watchlist.length === 0 && !err && (
        <div className="notice">
          Empty watchlist. Select a few products to generate Today’s recommendations.
        </div>
      )}

      <div className="grid">
        {filtered.map((p) => {
          const code = p.sku_id; // 先用 sku_id 充当 product_code
          const watched = state.watchlist.includes(code);
          return (
            <div key={code} className="card">
              <div className="thumb"><span>IMG</span></div>
              <div className="meta">
                <div className="name">{p.brand} {p.name} {p.spec}</div>
                <div className="sub">
                  <span className="pill">{p.category || "Category"}</span>
                  <span style={{ color: "var(--muted)" }}>Code: {code}</span>
                </div>
              </div>
              <div className="actions">
                <button
                  className={watched ? "btn" : "btn btn-primary"}
                  onClick={() => toggleWatch(code)}
                >
                  {watched ? "Unsubscribe" : "+ Subscribe"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
