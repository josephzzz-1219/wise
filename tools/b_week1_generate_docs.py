from pathlib import Path
import csv

DOCS_DIR = Path(__file__).resolve().parents[1] / "docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

DEMO_PRODUCTS = [
    ("P_DEMO_001", "家居用品", "清洁用品", "洗衣用品", "Lion", "洁白物语洗衣液 1L"),
    ("P_DEMO_002", "麵包 / 蛋糕", "蛋糕", "包装蛋糕", "Garden", "孖宝蛋糕 2件装"),
    ("P_DEMO_003", "粉麵", "即食麵", "袋装即食麵", "Nissin", "出前一丁 麻油味 1包"),
    ("P_DEMO_004", "飲品", "豆奶", "盒装豆奶", "Vitasoy", "维他奶豆奶 250ml"),
    ("P_DEMO_005", "飲品", "咖啡", "即溶咖啡", "Nestle", "雀巢咖啡 20条"),
    ("P_DEMO_006", "個人護理", "沐浴用品", "沐浴露", "Dove", "多芬沐浴露 1L"),
    ("P_DEMO_007", "個人護理", "口腔护理", "牙膏", "Colgate", "高露洁牙膏 180g"),
    ("P_DEMO_008", "家居用品", "清洁用品", "消毒用品", "Dettol", "滴露消毒液 1L"),
    ("P_DEMO_009", "調味", "汤料", "即煮汤料", "Maggi", "美极汤料 1盒"),
    ("P_DEMO_010", "飲品", "汽水", "罐装汽水", "CocaCola", "可口可乐 330ml"),
    ("P_DEMO_011", "糖果 / 小食", "薯片", "袋装薯片", "Calbee", "卡乐B薯片 1包"),
    ("P_DEMO_012", "奶類及乳製品", "鲜奶", "盒装鲜奶", "Meiji", "明治牛奶 1L"),
    ("P_DEMO_013", "奶類及乳製品", "乳酸饮品", "小瓶乳酸饮品", "Yakult", "益力多 5支装"),
    ("P_DEMO_014", "奶粉 / 嬰兒用品", "婴儿用品", "湿巾", "Johnson", "强生婴儿湿巾 80片"),
    ("P_DEMO_015", "個人護理", "洗发护发", "洗发水", "HeadShoulders", "海飞丝洗发水 750ml"),
    ("P_DEMO_016", "家居用品", "清洁用品", "清洁工具", "3M", "思高海绵百洁布 5片"),
    ("P_DEMO_017", "家居用品", "清洁用品", "洗洁精", "Sunlight", "洗洁精 750ml"),
    ("P_DEMO_018", "穀物早餐", "燕麦", "即食燕麦", "Quaker", "桂格燕麦片 1kg"),
    ("P_DEMO_019", "調味", "酱料", "番茄酱", "Heinz", "亨氏番茄酱 500g"),
    ("P_DEMO_020", "粉麵", "即食麵", "捞面", "Indomie", "营多捞面 1包"),
]

TARGET_STORES = [
    ("WELLCOME", "wellcome"),
    ("PARKNSHOP", "pns"),
    ("JASONS", "marketplace"),
]

def write_demo_products():
    out = DOCS_DIR / "demo_products_opw.csv"
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Category 1", "Category 2", "Category 3", "Product Code", "Brand", "Product Name"])
        for product_code, cat1, cat2, cat3, brand, name in DEMO_PRODUCTS:
            w.writerow([cat1, cat2, cat3, product_code, brand, name])
    return out

def write_store_links():
    out = DOCS_DIR / "store_links_seed.csv"
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Product Code", "Supermarket Code", "platform", "keyword"])
        for product_code, cat1, cat2, cat3, brand, name in DEMO_PRODUCTS:
            keyword = f"{brand} {name}"
            for supermarket_code, platform in TARGET_STORES:
                w.writerow([product_code, supermarket_code, platform, keyword])
    return out

def write_test_cases():
    out = DOCS_DIR / "test_cases_week1.md"
    content = """# Week1 测试用例（端到端）

## 环境
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- 测试用户：u1

## 用例 1：健康检查
步骤：
1) 浏览器打开 /health
期望：
- 返回 {"status":"ok"}

## 用例 2：商品列表加载
步骤：
1) 打开订阅页
2) 请求 GET /products
期望：
- 页面出现至少 20 个商品
- 不报错、不白屏

## 用例 3：保存订阅
步骤：
1) 勾选 2-3 个商品
2) 点击“保存订阅”（POST /watchlist）
期望：
- 返回 ok:true
- 跳转到今日清单页（或提示保存成功）

## 用例 4：今日购物清单渲染
步骤：
1) 打开 /daily
2) 请求 GET /daily_list?user_id=u1
期望：
- 显示 top_store.store 与 reason
- 显示 置顶/推荐/普通 三个分区（可为空）

## 用例 5：证据卡打开
步骤：
1) 在清单中点击某个商品
2) 请求 GET /evidence_card?sku_id=...&store=PNS
期望：
- 展示 price_today / avg_30 / low_180 / label / updated_at

## 用例 6：自提入口跳转
步骤：
1) 在证据卡页点击 WELLCOME/PNS/AEON 按钮
期望：
- 打开新窗口/新标签页
- 进入对应平台搜索页面

## 用例 7：一键导航 Plan A
步骤：
1) 在清单页点击 Plan A 导航
期望：
- 打开 Google Maps 线路页面

## 用例 8：空订阅容错
步骤：
1) 保存空订阅（sku_ids 为空）
2) 打开清单页
期望：
- 页面不崩
- 有空状态提示
"""
    out.write_text(content, encoding="utf-8")
    return out

if __name__ == "__main__":
    p1 = write_demo_products()
    p2 = write_store_links()
    p3 = write_test_cases()
    print("Generated:")
    print(" -", p1)
    print(" -", p2)
    print(" -", p3)
