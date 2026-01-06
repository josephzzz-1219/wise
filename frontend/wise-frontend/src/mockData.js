// src/mockData.js
export const MOCK_USER_ID = "u1";

// 先给一个兜底商品列表（即便 CSV 读失败也能显示）
export const MOCK_PRODUCTS = [
  { sku_id: "SKU001", brand: "Lion", name: "洗衣液", spec: "1L", category: "清洁" },
  { sku_id: "SKU002", brand: "嘉顿", name: "孖宝蛋糕", spec: "2pc", category: "零食" },
  { sku_id: "SKU003", brand: "Nissin", name: "出前一丁（麻油味）", spec: "1包", category: "速食" },
];

// 订阅先存在内存（刷新页面会丢，这在 Week1 也可以接受）
export const MOCK_WATCHLIST = {
  u1: ["SKU001", "SKU003"],
};

export function buildPickupLinks(keyword) {
  return [
    { platform: "wellcome", url: `https://www.wellcome.com.hk/zh/search?query=${encodeURIComponent(keyword)}` },
    { platform: "pns", url: `https://www.pns.hk/zh-hk/search?text=${encodeURIComponent(keyword)}` },
    { platform: "aeon", url: `https://www.aeonstores.com.hk/aeonsearch?keyword=${encodeURIComponent(keyword)}` },
  ];
}

export function mockDailyList(products) {
  const sku_ids = MOCK_WATCHLIST[MOCK_USER_ID] ?? [];
  const items = sku_ids
    .map((sku) => products.find((p) => p.sku_id === sku))
    .filter(Boolean)
    .map((p) => {
      const keyword = `${p.brand} ${p.name}`;
      return {
        sku_id: p.sku_id,
        display_name: `${p.brand} ${p.name} ${p.spec}`,
        store: "PNS",
        price: 25.0,
        label: "推荐",
        pickup_links: buildPickupLinks(keyword),
      };
    });

  return {
    top_store: {
      store: "PNS",
      reason: `覆盖${items.length}/${sku_ids.length}件；支持线上自提锁货（Week1假数据）`,
      maps_link_planA:
        "https://www.google.com/maps/dir/?api=1&origin=22.3080,114.2250&destination=22.3817,114.1872&travelmode=transit",
      maps_link_planB: "",
    },
    items_pinned: [],
    items_recommended: items,
    items_normal: [],
  };
}

export function mockEvidenceCard(sku_id, store = "PNS") {
  return {
    sku_id,
    store,
    price_today: 25.0,
    avg_30: 28.0,
    low_180: 24.0,
    label: "推荐",
    updated_at: "2026-01-06",
  };
}
