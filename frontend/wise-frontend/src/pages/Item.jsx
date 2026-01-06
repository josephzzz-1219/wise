import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import { useParams, Link } from "react-router-dom";

export default function Item() {
  const { sku_id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiGet(`/evidence_card?sku_id=${encodeURIComponent(sku_id)}&store=PNS`)
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, [sku_id]);

  const links = useMemo(() => {
    const keyword = sku_id; // Week1 最简：先用 sku_id 占位
    return [
      { platform: "wellcome", url: `https://www.wellcome.com.hk/zh/search?query=${encodeURIComponent(keyword)}` },
      { platform: "pns", url: `https://www.pns.hk/zh-hk/search?text=${encodeURIComponent(keyword)}` },
      { platform: "aeon", url: `https://www.aeonstores.com.hk/aeonsearch?keyword=${encodeURIComponent(keyword)}` },
    ];
  }, [sku_id]);

  if (err) return <div>加载失败：{err}</div>;
  if (!data) return <div>加载中...</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/daily">← 返回清单</Link>
      </div>

      <h2>证据卡</h2>
      <div>SKU：{data.sku_id}</div>
      <div>门店：{data.store}</div>
      <div>今日价：${data.price_today}</div>
      <div>30天均价：${data.avg_30}</div>
      <div>180天史低：${data.low_180}</div>
      <div>标签：{data.label}</div>
      <div>更新时间：{data.updated_at}</div>

      <h3 style={{ marginTop: 16 }}>去下单自提（跳转平台）</h3>
      {links.map((l) => (
        <button
          key={l.platform}
          onClick={() => window.open(l.url, "_blank")}
          style={{ marginRight: 8 }}
        >
          {l.platform.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
