# MTS' Harry Potter TCG 中文卡牌資料庫

這是由原本 statistics-website 精簡出來的 Harry Potter TCG 中文資料庫版本。

## 已保留

- Vite + React 基礎架構
- Supabase 連線方式
- 瀏覽人數記錄功能
- Header / Footer / Hash Router 結構

## 已刪除

- 統計學文章、公式、計算器、方法選擇器、案例庫、詞彙表、學習路線等不相關功能
- dist、node_modules、.git 等不應上傳到 GitHub 的資料夾

## 新增

- 卡牌列表
- 搜尋與篩選
- 卡牌詳情彈窗
- 商品情報
- 新聞 / 更新紀錄
- 活動頁
- 牌組功能預留頁
- Supabase SQL：supabase/hp_tcg_schema.sql

## 安裝

```bash
npm install
npm run dev
```

## Supabase

1. 在 Supabase 的 statistics-website project 開 SQL Editor
2. 貼上 `supabase/hp_tcg_schema.sql`
3. 複製 `.env.example` 為 `.env.local`
4. 填入 Supabase URL 和 Anon Key

```env
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```
