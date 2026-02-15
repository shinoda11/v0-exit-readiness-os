# CLAUDE.md

## プロジェクト概要
YOHACK（旧 Exit Readiness OS）- 人生の余白（お金・時間・体力）で人生の選択を比較するシミュレーター。
FIRE達成可能性をモンテカルロシミュレーションで計算し、住宅・キャリア・家族の意思決定を支援する。

## 技術スタック
- Next.js 16 + React 19 + TypeScript
- Zustand（状態管理）
- Recharts（グラフ）
- shadcn/ui + Tailwind CSS（UI）
- Vercel（デプロイ、GitHub main ブランチ連携）

## アーキテクチャ原則

### Single Source of Truth (SoT)
- `lib/store.ts` がアプリ全体の状態管理の唯一の場所
- `lib/v2/store.ts` は世界線比較の UI 状態専用（計算結果は持たない）
- 第三のストアを絶対に作らない
- 新しい状態が必要な場合は既存ストアを拡張する
- 違反チェック: `npm run check:store`

### ディレクトリ構造
```
app/
  page.tsx          ← シミュレーション（プロファイル入力 + 結果表示）
  plan/page.tsx     ← ライフプラン（ライフイベント + RSU タブ切替）
  v2/page.tsx       ← 世界線比較（157行、分割済み・10コンポーネント）
  settings/         ← 設定（データ管理・バージョン情報）
  legal/            ← 利用規約・プライバシーポリシー・特商法
  timeline/         ← /plan へリダイレクト
  rsu/              ← /plan?tab=rsu へリダイレクト

middleware.ts       ← Basic認証（SITE_PASSWORD）

components/
  dashboard/        ← ダッシュボード用（22コンポーネント）
  plan/             ← ライフプラン用（timeline-content, rsu-content）
  v2/               ← 世界線比較用（10コンポーネント）
  layout/sidebar.tsx ← サイドバーナビゲーション
  ui/               ← shadcn/ui コンポーネント

lib/
  store.ts          ← Zustand SoT（profile, simResult, scenarios）
  engine.ts         ← モンテカルロシミュレーション（1000回、max age 100）
  types.ts          ← 型定義
  v2/               ← 世界線比較ロジック（store, adapter, events, margin, strategy, worldline）

hooks/
  useSimulation.ts  ← シミュレーション実行フック
  useMargin.ts      ← 余白計算
  useStrategy.ts    ← 戦略計算
  useWorldLines.ts  ← 世界線比較
```

## コマンド
- `pnpm dev` — 開発サーバー起動
- `pnpm build` — ビルド
- `npm run check:store` — SoT ガードレールチェック
- `pnpm lint` — ESLint

## コーディング規約
- UIコンポーネントは shadcn/ui を使用
- スタイリングは Tailwind CSS
- 金額の単位は万円（`formatCurrency()` で億円表示に自動変換）
- UI は日本語
- カラーパレットは落ち着いたグレートーン（`globals.css` の CSS 変数参照）
- コンポーネントファイルは `'use client'` ディレクティブ必須

## テスト
- `lib/__tests__/` に3件（adapter, engine, housing-sim）。vitest 使用
- `pnpm test` — テスト実行、`pnpm test:watch` — ウォッチモード

## 重要な注意点
- Pro/Free レイヤー（`lib/plan.ts`）は現在 `isPro()=true` で全機能開放中。Phase 2 で Supabase 認証に置き換え予定
- `typescript.ignoreBuildErrors: true` が有効（`next.config.mjs`）
- localStorage でプロファイルとシナリオを永続化している
- シミュレーションは profile 変更時に自動で debounce 実行される
