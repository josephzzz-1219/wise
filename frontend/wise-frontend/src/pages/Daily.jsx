import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import { Link } from "react-router-dom";

export default function Daily() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    apiGet("/daily_list?user_id=u1")
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return null;
    const kw = q.trim().toLowerCase();
    const apply = (arr) =>
      (arr ?? []).filter((i) => {
        if (!kw) return true;
        const hay = `${i.display_name} ${i.store} ${i.label}`.toLowerCase();
        return hay.includes(kw);
      });
    return {
      ...data,
      items_pinned: apply(data.items_pinned),
      items_recommended: apply(data.items_recommended),
      items_normal: apply(data.items_normal),
    };
  }, [data, q]);

  if (err) return <div className="container">加载失败：{err}</div>;
  if (!filtered) return <div className="container">加载中...</div>;

  const pinned = filtered.items_pinned ?? [];
  const rec = filtered.items_recommended ?? [];
  const normal = filtered.items_normal ?? [];

  return (
    <div className="container">
      <div className="page-title">Today’s pickup list</div>
      <div className="page-subtitle">
        Generated from your subscriptions. Click an item to view the evidence card.
      </div>

      <div className="searchbar">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search in today’s list..."
        />
        <span className="pill">{pinned.length + rec.length + normal.length} items</span>

        {filtered.top_store?.maps_link_planA && (
          <button
            className="btn btn-primary"
            onClick={() => window.open(filtered.top_store.maps_link_planA, "_blank")}
          >
            Plan A导航
          </button>
        )}
      </div>

      <div className="notice">
        <b>Top store:</b> {filtered.top_store?.store || "—"} <br />
        {filtered.top_store?.reason || ""}
      </div>

      <Section title="Pinned (All-time low)" items={pinned} />
      <Section title="Recommended (Below average)" items={rec} />
      <Section title="Normal" items={normal} />
    </div>
  );
}

function Section({ title, items }) {
  return (
    <>
      <h3 style={{ margin: "18px 0 10px" }}>{title}</h3>
      {items.length === 0 ? (
        <div className="notice">No items.</div>
      ) : (
        <div className="grid">
          {items.map((i) => (
            <div key={i.sku_id} className="card">
              <div className="thumb">
                <span>IMG</span>
              </div>

              <div className="meta">
                <div className="name">
                  <Link to={`/item/${i.sku_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {i.display_name}
                  </Link>
                </div>
                <div className="sub">
                  <span className="pill">{i.label}</span>
                  <span>{i.store}</span>
                </div>
              </div>

              <div className="actions">
                <div className="kpi">${Number(i.price ?? 0).toFixed(2)}</div>
                <Link to={`/item/${i.sku_id}`} className="btn btn-primary" style={{ textDecoration: "none" }}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
