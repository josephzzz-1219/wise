// src/api.js
import { MOCK_PRODUCTS, MOCK_WATCHLIST, MOCK_USER_ID, mockDailyList, mockEvidenceCard } from "./mockData";

export const API_BASE = "http://localhost:8000";

// 关键：先不连后端，强制 mock
const USE_MOCK = true;

export async function apiGet(path) {
  if (USE_MOCK) {
    // 模拟后端路由
    if (path.startsWith("/products")) return MOCK_PRODUCTS;

    if (path.startsWith("/daily_list")) return mockDailyList(MOCK_PRODUCTS);

    if (path.startsWith("/evidence_card")) {
      const u = new URL(API_BASE + path);
      const sku_id = u.searchParams.get("sku_id") ?? "UNKNOWN";
      const store = u.searchParams.get("store") ?? "PNS";
      return mockEvidenceCard(sku_id, store);
    }

    if (path.startsWith("/watchlist")) {
      return { user_id: MOCK_USER_ID, sku_ids: MOCK_WATCHLIST[MOCK_USER_ID] ?? [] };
    }

    throw new Error(`Mock: unknown GET ${path}`);
  }

  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path, body) {
  if (USE_MOCK) {
    if (path === "/watchlist") {
      const user_id = body?.user_id ?? MOCK_USER_ID;
      const sku_ids = body?.sku_ids ?? [];
      MOCK_WATCHLIST[user_id] = sku_ids;
      return { ok: true };
    }
    throw new Error(`Mock: unknown POST ${path}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
