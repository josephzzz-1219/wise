import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import "./app.css";

import Watchlist from "./pages/Watchlist";
import Today from "./pages/Today";
import RoutePage from "./pages/RoutePage";
import Profile from "./pages/Profile";

import { AppStoreProvider } from "./store.jsx";

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/today">
          <img src="/assets/logo.png" alt="OnTheWay Deals" />
          <div className="brand-title">
            <b>OnTheWay Deals</b>
            <span>Subscribe → Recommend → Evidence → Pickup</span>
          </div>
        </a>
      </div>
    </div>
  );
}

function BottomTabs() {
  const tabClass = ({ isActive }) => (isActive ? "tab active" : "tab");
  return (
    <div className="bottombar">
      <NavLink to="/watchlist" className={tabClass}>Watchlist</NavLink>
      <NavLink to="/today" className={tabClass}>Today</NavLink>
      <NavLink to="/route" className={tabClass}>Route</NavLink>
      <NavLink to="/profile" className={tabClass}>Profile</NavLink>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppStoreProvider>
        <TopBar />
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/today" element={<Today />} />
          <Route path="/route" element={<RoutePage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomTabs />
      </AppStoreProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
