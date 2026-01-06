import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext(null);

const LS_KEY = "otwd_state_v1";

const DEFAULT = {
  user_id: "u1",
  // Watchlist：存 product_code 数组
  watchlist: [],
  // Route cart：存 product_code 数组
  route_cart: [],
  // Profile settings
  preferred_store_code: "PARKNSHOP", // WELLCOME | PARKNSHOP | JASONS
  notify_price_drop: true,
};

export function AppStoreProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => {
    return {
      state,
      setState,

      // watchlist
      toggleWatch(code) {
        setState((s) => {
          const has = s.watchlist.includes(code);
          const watchlist = has ? s.watchlist.filter((x) => x !== code) : [...s.watchlist, code];
          return { ...s, watchlist };
        });
      },
      clearWatch() {
        setState((s) => ({ ...s, watchlist: [] }));
      },

      // route cart
      toggleRouteCart(code) {
        setState((s) => {
          const has = s.route_cart.includes(code);
          const route_cart = has ? s.route_cart.filter((x) => x !== code) : [...s.route_cart, code];
          return { ...s, route_cart };
        });
      },
      clearRouteCart() {
        setState((s) => ({ ...s, route_cart: [] }));
      },

      // profile
      setPreferredStore(code) {
        setState((s) => ({ ...s, preferred_store_code: code }));
      },
      setNotifyPriceDrop(v) {
        setState((s) => ({ ...s, notify_price_drop: v }));
      },
    };
  }, [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used inside AppStoreProvider");
  return v;
}
