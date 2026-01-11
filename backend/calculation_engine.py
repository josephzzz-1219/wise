# calculation_engine.py - 历史基准计算器
import csv
import json
import statistics

INPUT_HISTORY = "output/price_history.csv"
OUTPUT_BENCHMARK = "output/benchmarks.json"


def run_calculation():
    print("🧠 [Calc] 启动：根据历史数据计算 Benchmark...")

    prices_by_sku = {}

    # 1. 读取清洗后的历史数据
    try:
        with open(INPUT_HISTORY, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sku = row['sku_id']
                p = float(row['price'])
                if sku not in prices_by_sku:
                    prices_by_sku[sku] = []
                prices_by_sku[sku].append(p)
    except FileNotFoundError:
        print("❌ 找不到历史文件，请先运行 etl_pipeline.py！")
        return

    # 2. 计算基准线 (T-1)
    benchmarks = {}
    for sku, prices in prices_by_sku.items():
        # 数据太少不算
        if len(prices) < 2: continue

        # [cite_start]核心算法 [cite: 3]
        avg_30 = round(statistics.mean(prices[-30:]), 1)
        low_180 = min(prices[-180:])

        benchmarks[sku] = {
            "avg_30": avg_30,
            "low_180": low_180
        }

    # 3. 落盘
    with open(OUTPUT_BENCHMARK, 'w', encoding='utf-8') as f:
        json.dump(benchmarks, f, indent=2)

    print(f"✅ [Calc] 计算完毕！已生成 {len(benchmarks)} 条基准数据。")


if __name__ == "__main__":
    run_calculation()