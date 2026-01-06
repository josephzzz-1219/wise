# Week1 测试用例（端到端）

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
