import { useAppStore } from "../store.jsx";

export default function Profile() {
  const { state, setPreferredStore, setNotifyPriceDrop } = useAppStore();

  return (
    <div className="container">
      <div className="page-title">Profile</div>
      <div className="page-subtitle">Preferences & data notes (Week1 UI-only is OK).</div>

      <div className="card" style={{ alignItems: "stretch" }}>
        <div className="meta">
          <div className="name">Preferred store</div>
          <div className="sub">Used as default when generating Today / Route.</div>
        </div>
        <div className="actions" style={{ alignItems: "flex-end" }}>
          <select className="btn" value={state.preferred_store_code} onChange={(e) => setPreferredStore(e.target.value)}>
            <option value="WELLCOME">WELLCOME</option>
            <option value="PARKNSHOP">PARKNSHOP</option>
            <option value="JASONS">JASONS</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ alignItems: "stretch", marginTop: 12 }}>
        <div className="meta">
          <div className="name">Price drop notification (UI)</div>
          <div className="sub">Week1 can be UI-only (no push service required).</div>
        </div>
        <div className="actions">
          <button className={state.notify_price_drop ? "btn btn-primary" : "btn"} onClick={() => setNotifyPriceDrop(!state.notify_price_drop)}>
            {state.notify_price_drop ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="notice" style={{ marginTop: 12 }}>
        <b>Data note:</b> Prices are from OPW historical data (demo). Updated daily (Week1 mock). <br />
        <b>Privacy:</b> No personal location is stored in Week1 demo.
      </div>
    </div>
  );
}
