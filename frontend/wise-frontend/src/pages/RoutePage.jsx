import { useMemo } from "react";
import { useAppStore } from "../store.jsx";
import { buildPickupLinks } from "../mockData"; // 你已有的 helper

export default function RoutePage() {
  const { state, clearRouteCart } = useAppStore();

  const items = state.route_cart;

  const planAUrl = useMemo(() => {
    // Week1 简化：直接打开一个示例路线（后续联调用后端返回 google_maps_url）
    return "https://www.google.com/maps/dir/?api=1&origin=22.3080,114.2250&destination=22.3817,114.1872&travelmode=transit";
  }, []);

  const planBUrl = useMemo(() => {
    return "https://www.google.com/maps/dir/?api=1&origin=22.3080,114.2250&destination=22.3964,114.1095&travelmode=transit";
  }, []);

  return (
    <div className="container">
      <div className="page-title">Route</div>
      <div className="page-subtitle">Build Plan A / Plan B based on selected items.</div>

      {items.length === 0 ? (
        <div className="notice">
          No items in route yet. Go to Today and click “Add Route”.
        </div>
      ) : (
        <div className="notice">
          Items in route: <b>{items.length}</b> <br />
          {items.join(", ")}
        </div>
      )}

      <div className="grid">
        <div className="card">
          <div className="meta">
            <div className="name">Plan A (one-store-first)</div>
            <div className="sub">
              <span className="pill">{state.preferred_store_code}</span>
              <span className="pill">LOW risk</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => window.open(planAUrl, "_blank")}>
              Open Google Maps
            </button>
          </div>
        </div>

        <div className="card">
          <div className="meta">
            <div className="name">Plan B (backup)</div>
            <div className="sub">
              <span className="pill">ALT store</span>
              <span className="pill">MED risk</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn" onClick={() => window.open(planBUrl, "_blank")}>
              Open Plan B
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn" onClick={clearRouteCart} disabled={items.length === 0}>Clear route items</button>
      </div>
    </div>
  );
}
