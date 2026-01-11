# etl_pipeline.py - 历史数据清洗器
import csv
import os
import re
import json

# === 配置 ===
HISTORY_FOLDER = "historyData"  # 历史数据源
OUTPUT_FILE = "output/price_history.csv"  # 清洗后的历史大表
PRODUCT_INFO_FILE = "output/products_db.json"  # 商品基础信息表


def extract_date_from_filename(filename):
    # 从 "20240418-1013..." 提取 "2024-04-18"
    match = re.search(r"(\d{4})(\d{2})(\d{2})", filename)
    if match:
        return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
    return None


def clean_price(price_str):
    try:
        # 去掉 $ 和空格，比如 "$ 10.50" -> 10.5
        clean_str = re.sub(r'[^\d.]', '', str(price_str))
        return float(clean_str)
    except:
        return 0.0


def run_etl():
    print("🧹 [ETL] 启动：正在清洗 data/history 下的历史数据...")

    if not os.path.exists("output"): os.makedirs("output")
    if not os.path.exists(HISTORY_FOLDER):
        print(f"❌ 错误：找不到 {HISTORY_FOLDER} 文件夹！")
        return

    all_history = []
    unique_products = {}

    files = [f for f in os.listdir(HISTORY_FOLDER) if f.endswith(".csv")]
    print(f"📂 发现 {len(files)} 个历史文件。")

    for filename in files:
        date_str = extract_date_from_filename(filename)
        if not date_str: continue

        path = os.path.join(HISTORY_FOLDER, filename)
        try:
            with open(path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    sku = row.get("貨品編號")
                    price_raw = row.get("價格")

                    if not sku: continue
                    price = clean_price(price_raw)
                    if price <= 0: continue

                    # 存入历史记录
                    all_history.append({
                        "sku_id": sku,
                        "date": date_str,
                        "price": price,
                        "store": row.get("超市代號", "Unknown")
                    })

                    # 提取商品信息 (用于前端展示)
                    if sku not in unique_products:
                        unique_products[sku] = {
                            "sku_id": sku,
                            "name": row.get("貨品名稱", "Unknown Name"),
                            "brand": row.get("品牌", "Unknown Brand"),
                            "cat": row.get("貨品分類1", "General")
                        }
        except Exception as e:
            print(f"⚠️ 无法读取 {filename}: {e}")

    # 保存历史价格大表
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["sku_id", "date", "price", "store"])
        writer.writeheader()
        writer.writerows(all_history)

    # 保存商品库 (main.py 需要用到)
    with open(PRODUCT_INFO_FILE, 'w', encoding='utf-8') as f:
        json.dump(list(unique_products.values()), f, ensure_ascii=False, indent=2)

    print(f"✅ [ETL] 完成！提取了 {len(all_history)} 条历史记录。")


if __name__ == "__main__":
    run_etl()