import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { useAppStore } from "../store.jsx";
import Modal from "../ui/Modal";

// label enum
const LABELS = {
  HIST_LOW: { title: "HIST_LOW", text: "All-time low", pill: "HIST_LOW" },
  BELOW_AVG: { title: "BELOW_AVG", text: "Below average", pill: "BELOW_AVG" },
  NORMAL: { title: "NORMAL", text: "Stable", pill: "NORMAL" },
};

export default function Today() {
  const nav = useNavigate();
  const { state, toggleRouteCart } = useAppStore();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  // Evidence modal state
  const [eviOpen, setEviOpen] = useState(false);
  const [evi, setEvi] = useState(null);

  // Store chooser (optional modal)
  const [storeOpen, setStoreOpen] = useState(false);

  useEffect(() => {
    // 未来联调：/daily_list?user_id=...
    apiGet(`/daily_list?user_id=${encodeURIComponent(state.user_id)}`)
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, [state.user_id, state.watchlist.length]); // 订阅变化就刷新

  const itemsAll = useMemo(() => {
    if (!data) return [];
    const a = [
      ...(data.items_pinned ?? []),
      ...(data.items_recommended ?? []),
      ...(data.items_normal ?? []),
    ];
    const kw = q.trim().toLowerCase();
    if (!kw) return a;
    return a.filter((i) => `${i.display_name} ${i.label} ${i.recommended_store_code || ""}`.toLowerCase().includes(kw));
  }, [data, q]);

  const grouped = useMemo(() => {
    const g = { HIST_LOW: [], BELOW_AVG: [], NORMAL: [] };
    for (const it of itemsAll) {
      const lab = it.label || "NORMAL";
      if (!g[lab]) g[lab] = [];
      g[lab].push(it);
    }
    return g;
  }, [itemsAll]);

  async function openEvidence(item) {
    // 未来联调：/evidence_card?product_code=...
    const res = await apiGet(`/evidence_card?sku_id=${encodeURIComponent(item.product_code)}&store=${encodeURIComponent(item.recommended_store_code || state.preferred_store_code)}`);
    setEvi({ ...res, display_name: item.display_name, store_links: item.store_links ?? [] });
    setEviOpen(true);
  }

  if (err) return <div className="container">Load failed: {err}</div>;
  if (!data) return <div className="container">Loading...</div>;

  const top = data.top_store;

  return (
    <div className="container">
      <div className="page-title">Today</div>
      <div className="page-subtitle">
        Default strategy: try to buy everything in one store first (time-saving). If not found, use Plan B.
      </div>

      <div className="searchbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in today’s list..." />
        <span className="pill">{itemsAll.length} items</span>
        <button className="btn btn-primary" onClick={() => setStoreOpen(true)}>
          One-click pickup
        </button>
        <button className="btn" onClick={() => nav("/route")}>
          Plan route
        </button>
      </div>

      <div className="notice">
        <b>Recommended store:</b> {top?.store || state.preferred_store_code} <br />
        {top?.reason || "Coverage-first, then lowest price, then lowest risk."} <br />
        <span style={{ color: "var(--muted)" }}>Last updated: {top?.updated_at || data.updated_at || "—"}</span>
      </div>

      <Section
        title="Pinned (HIST_LOW)"
        items={grouped.HIST_LOW}
        onEvidence={openEvidence}
        onToggleRoute={toggleRouteCart}
        routeCart={state.route_cart}
      />
      <Section
        title="Recommended (BELOW_AVG)"
        items={grouped.BELOW_AVG}
        onEvidence={openEvidence}
        onToggleRoute={toggleRouteCart}
        routeCart={state.route_cart}
      />
      <Section
        title="Normal (NORMAL)"
        items={grouped.NORMAL}
        onEvidence={openEvidence}
        onToggleRoute={toggleRouteCart}
        routeCart={state.route_cart}
      />

      <Modal
        open={eviOpen}
        title={evi?.display_name ? `Evidence Card — ${evi.display_name}` : "Evidence Card"}
        onClose={() => setEviOpen(false)}
      >
        {evi && <EvidenceCard evidence={evi} />}
      </Modal>

      <Modal
        open={storeOpen}
        title="Choose store (Plan A / Plan B)"
        onClose={() => setStoreOpen(false)}
      >
        <StoreChooser topStore={top} onClose={() => setStoreOpen(false)} />
      </Modal>
    </div>
  );
}

function Section({ title, items, onEvidence, onToggleRoute, routeCart }) {
  return (
    <>
      <h3 style={{ margin: "18px 0 10px" }}>{title}</h3>
      {items.length === 0 ? (
        <div className="notice">No items.</div>
      ) : (
        <div className="grid">
          {items.map((i) => {
            const inRoute = routeCart.includes(i.product_code);
            return (
              <div key={i.product_code} className="card">
                <div className="thumb"><span>IMG</span></div>
                <div className="meta">
                  <div className="name">{i.display_name}</div>
                  <div className="sub">
                    <span className="pill">{i.label}</span>
                    <span className="pill">{i.recommended_store_code}</span>
                    <span className="pill">{i.availability_confidence || "MED"} risk</span>
                  </div>
                </div>
                <div className="actions">
                  <div className="kpi">${Number(i.price_today ?? i.price ?? 0).toFixed(2)}</div>
                  <button className="btn btn-primary" onClick={() => onEvidence(i)}>Evidence</button>
                  <button className="btn" onClick={() => onToggleRoute(i.product_code)}>
                    {inRoute ? "Remove Route" : "Add Route"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function EvidenceCard({ evidence }) {
  const {
    product_code, sku_id,
    price_today, avg_30, avg_60, avg_180, low_180,
    reason_text, updated_at,
    risk_score, availability_confidence,
    store_links = [],
  } = evidence;

  const code = product_code || sku_id || "—";

  // fallback keyword logic: primary first, fallback if user clicks
  function openLink(link, useFallback = false) {
    const url = useFallback && link.url_fallback ? link.url_fallback : link.url_primary || link.url;
    if (url) window.open(url, "_blank");
  }

  return (
    <div>
      <div className="notice">
        <b>Product code:</b> {code} <br />
        <b>Today:</b> ${Number(price_today ?? 0).toFixed(2)} <br />
        <b>avg_30:</b> ${Number(avg_30 ?? 0).toFixed(2)} | <b>avg_60:</b> ${Number(avg_60 ?? 0).toFixed(2)} | <b>avg_180:</b> ${Number(avg_180 ?? 0).toFixed(2)} <br />
        <b>low_180:</b> ${Number(low_180 ?? 0).toFixed(2)} <br />
        <b>Reason:</b> {reason_text || "Below average / new low (demo)"} <br />
        <b>Risk:</b> {availability_confidence || (risk_score != null ? `score ${risk_score}` : "—")} <br />
        <span style={{ color: "var(--muted)" }}>Updated: {updated_at || "—"}</span>
      </div>

      <h3 style={{ margin: "12px 0 8px" }}>Order pickup (search)</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(store_links.length ? store_links : [
          { store_code: "WELLCOME", platform: "wellcome", url_primary: "https://www.wellcome.com.hk/zh/search?query=" + encodeURIComponent(code) },
          { store_code: "PARKNSHOP", platform: "pns", url_primary: "https://www.pns.hk/zh-hk/search?text=" + encodeURIComponent(code) },
          { store_code: "JASONS", platform: "marketplace", url_primary: "https://www.aeonstores.com.hk/aeonsearch?keyword=" + encodeURIComponent(code) },
        ]).map((l) => (
          <div key={l.store_code} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn btn-primary" onClick={() => openLink(l, false)}>
              {l.store_code} search
            </button>
            <button className="btn" onClick={() => openLink(l, true)}>
              Fallback keyword
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn">I bought it (feedback)</button>
        <button className="btn">Not found / OOS</button>
      </div>
    </div>
  );
}

function StoreChooser({ topStore, onClose }) {
  const planA = topStore?.maps_link_planA;
  const planB = topStore?.maps_link_planB;

  return (
    <div>
      <div className="notice">
        Plan A: try to buy everything in one store first. <br />
        Plan B: use as backup when “not found / OOS”.
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => planA && window.open(planA, "_blank")} disabled={!planA}>
          Open Plan A (Google Maps)
        </button>
        <button className="btn" onClick={() => planB && window.open(planB, "_blank")} disabled={!planB}>
          Open Plan B
        </button>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
