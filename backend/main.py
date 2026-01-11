# main.py - 在线 API 服务
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import os
import csv
import re

app = FastAPI()

# 开启跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 0. 变量与配置 ===
BENCHMARKS = {}  # 历史标准
PRODUCT_INFO = {}  # 商品名字
WATCHLIST = {"u1": []}
INCOMING_FOLDER = "data/incoming"  # Member B 放今日 CSV 的地方


# === 1. 启动时加载历史基准 ===
@app.on_event("startup")
def load_static_data():
    global BENCHMARKS, PRODUCT_INFO

    # 加载 benchmark
    if os.path.exists("output/benchmarks.json"):
        with open("output/benchmarks.json", 'r', encoding='utf-8') as f:
            BENCHMARKS = json.load(f)

    # 加载商品信息
    if os.path.exists("output/products_db.json"):
        with open("output/products_db.json", 'r', encoding='utf-8') as f:
            p_list = json.load(f)
            # 转成字典方便查询
            PRODUCT_INFO = {p['sku_id']: p for p in p_list}

    print(f"✅ 系统就绪：加载了 {len(BENCHMARKS)} 条基准，{len(PRODUCT_INFO)} 个商品信息。")
    print("open http://127.0.0.1:8000/docs")


# === 2. 动态读取今日 CSV (Member B 的数据) ===
def get_todays_prices_from_csv():
    # 找到 incoming 文件夹里最新的那个 csv
    if not os.path.exists(INCOMING_FOLDER): return {}

    files = [f for f in os.listdir(INCOMING_FOLDER) if f.endswith(".csv")]
    if not files: return {}

    # 假设最新的文件就是今天的
    latest_file = sorted(files)[-1]
    path = os.path.join(INCOMING_FOLDER, latest_file)
    print(f"📅 正在读取今日数据源: {latest_file}")

    today_data = {}
    try:
        with open(path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sku = row.get("貨品編號")
                price_str = row.get("價格")
                store = row.get("超市代號", "Unknown")

                if sku and price_str:
                    try:
                        price = float(re.sub(r'[^\d.]', '', price_str))
                        today_data[sku] = {"price": price, "store": store}
                    except:
                        pass
    except Exception as e:
        print(f"❌ 读取今日 CSV 失败: {e}")

    return today_data


# === 3. 生成跳转链接 (伪爬虫) ===
def get_links(keyword):
    return [
        {"platform": "wellcome", "url": f"https://www.wellcome.com.hk/zh/search?query={keyword}"},
        {"platform": "pns", "url": f"https://www.pns.hk/zh-hk/search?text={keyword}"},
        {"platform": "aeon", "url": f"https://www.aeonstores.com.hk/aeonsearch?keyword={keyword}"},
    ]


# === API 接口 ===

@app.get("/daily_list")
def daily_list(user_id: str = "u1"):
    # 1. 读入今日价格
    today_prices = get_todays_prices_from_csv()
    if not today_prices:
        return {"error": "Member B 还没有上传今日 CSV！"}

    # 2. 读入用户订阅
    my_skus = WATCHLIST.get(user_id, [])

    # 3. 结果容器
    pinned = []
    rec = []
    normal = []

    # 4. 如果用户没订阅，或者为了演示，我们可以遍历今日所有的商品
    # 这里演示逻辑：遍历今日 CSV 里的前 50 个商品
    target_skus = my_skus if my_skus else list(today_prices.keys())[:50]

    for sku in target_skus:
        # 获取今日信息
        live = today_prices.get(sku)
        if not live: continue  # 今天没这个货

        current_price = live['price']

        # 获取历史基准
        bm = BENCHMARKS.get(sku)
        info = PRODUCT_INFO.get(sku, {"name": "未知商品", "brand": ""})

        # === 核心比价逻辑 ===
        label = "Normal"
        reason = "价格平稳"

        if bm:
            avg = bm['avg_30']
            low = bm['low_180']

            if current_price <= low:
                label = "Super Deal"
                reason = f"🔥 破180天史低 (均价 ${avg})"
            elif current_price < avg:
                label = "Recommended"
                reason = f"📉 低于均价 ${avg}"

        item = {
            "sku_id": sku,
            "display_name": f"{info['brand']} {info['name']}",
            "store": live['store'],
            "price": current_price,
            "label": label,
            "pickup_links": get_links(info['name'])
        }

        if label == "Super Deal":
            pinned.append(item)
        elif label == "Recommended":
            rec.append(item)
        else:
            normal.append(item)

    return {
        "top_store": {"store": "PNS", "reason": "Smart Choice", "maps_link_planA": "http://maps.google.com"},
        "items_pinned": pinned,
        "items_recommended": rec,
        "items_normal": normal
    }


# 订阅接口
class WatchlistPayload(BaseModel):
    user_id: str
    sku_ids: List[str]


@app.post("/watchlist")
def set_watchlist(payload: WatchlistPayload):
    WATCHLIST[payload.user_id] = payload.sku_ids
    return {"ok": True}


@app.get("/products")
def get_products():
    # 返回前 20 个给前端做 Demo
    return list(PRODUCT_INFO.values())[:20]


# 证据卡接口
@app.get("/evidence_card")
def evidence_card(sku_id: str):
    # 读今日
    today = get_todays_prices_from_csv().get(sku_id, {"price": 0, "store": "-"})
    # 读历史
    bm = BENCHMARKS.get(sku_id, {"avg_30": 0, "low_180": 0, "label": "No Data"})

    return {
        "sku_id": sku_id,
        "price_today": today['price'],
        "store": today['store'],
        "avg_30": bm['avg_30'],
        "low_180": bm['low_180'],
        "label": "Computed Live",
        "updated_at": "Today"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)