// 基础配置
// ======================================================
const USE_MOCK = true; // true: 使用 mock 数据，false: 调用真实后端
const API_BASE = "";    // 后端基础地址（未来扩展）

// ======================================================
// Mock 数据
// ======================================================
const MOCK_USER_ID = "user_001";

const MOCK_PRODUCTS = [
  { sku_id: "A001", name: "Milk", store: "PNS" },
  { sku_id: "B002", name: "Bread", store: "WELLcome" },
];

const MOCK_WATCHLIST = {
  user_001: ["A001", "B002"],
};

// Mock daily_list 示例数据
function mockDailyList(products, user_id = MOCK_USER_ID) {
  return products.map((p) => ({
    sku_id: p.sku_id,
    name: p.name,
    store: p.store,
    today_price: Math.floor(Math.random() * 20) + 5, // 5~25 随机价格
    user_id,
  }));
}

// ======================================================
// Mock API：GET
// ======================================================
export async function apiGet(path) {
  if (USE_MOCK) {
    // products
    if (path.startsWith("/products")) return MOCK_PRODUCTS;

    // watchlist
    if (path.startsWith("/watchlist")) {
      return {
        user_id: MOCK_USER_ID,
        sku_ids: MOCK_WATCHLIST[MOCK_USER_ID],
      };
    }

    // daily_list (浏览器安全版本)
    if (path.startsWith("/daily_list")) {
      // 解析 query string
      const search = path.split("?")[1] || "";
      const params = new URLSearchParams(search);
      const user_id = params.get("user_id") || MOCK_USER_ID;
      return mockDailyList(MOCK_PRODUCTS, user_id);
    }

    throw new Error(`Mock GET not implemented: ${path}`);
  }

  // 调用真实后端
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ======================================================
// Mock API：POST
// ======================================================
export async function apiPost(path, body) {
  if (USE_MOCK) {
    if (path === "/watchlist") {
      MOCK_WATCHLIST[body.user_id] = body.sku_ids;
      return { ok: true };
    }

    throw new Error(`Mock POST not implemented: ${path}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ======================================================
// 路线规划模块（D 部分核心）
// ======================================================

// 1️⃣ 获取用户当前位置（mock）
export function getUserLocation() {
  return new Promise((resolve) => {
    resolve({
      lat: 22.3027,
      lng: 114.1772,
    });
  });
}

// 2️⃣ Mock 商店坐标
const STORE_LOCATIONS = {
  PNS: { lat: 22.3027, lng: 114.1772 },
  WELLcome: { lat: 22.2819, lng: 114.1589 },
  Marketplace: { lat: 22.3193, lng: 114.1694 },
};

// 3️⃣ Mock 单店路线规划
function mockDirections(origin, destination) {
  return {
    distance: "2.5 km",
    duration: "30 mins",
    start_address: "User Location",
    end_address: "Selected Store",
    steps: [
      { instruction: "Walk straight for 300 meters" },
      { instruction: "Turn left at the intersection" },
      { instruction: "Arrive at destination" },
    ],
  };
}

// 4️⃣ 单平台路线接口（mock + 未来 Google Maps API）
export async function planSingleStoreRoute(origin, destination, mode = "walking") {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("No Google Maps API key, using mock route");
    return mockDirections(origin, destination);
  }

  // 未来接 Google Maps API
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode,
    key: apiKey,
  });

  const url = `https://maps.googleapis.com/maps/api/directions/json?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  const leg = data.routes[0].legs[0];
  return {
    distance: leg.distance.text,
    duration: leg.duration.text,
    start_address: leg.start_address,
    end_address: leg.end_address,
    steps: leg.steps,
  };
}

// 5️⃣ 多平台路线规划（mock）
export async function planMultiStoreRoute(origin, storeList) {
  return storeList.map((store, index) => ({
    step: index + 1,
    from: index === 0 ? "User Location" : "Previous Store",
    to: store,
    distance: "1.3 km",
    duration: "15 mins",
  }));
}

// 6️⃣ 获取某 SKU 最便宜的商店（mock）
export function getCheapestStoreForSKU(sku_id) {
  const product = MOCK_PRODUCTS.find((p) => p.sku_id === sku_id);
  if (!product) return null;
  return { store: product.store, location: STORE_LOCATIONS[product.store] };
}