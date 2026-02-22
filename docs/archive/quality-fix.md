# 品質修正: 監査結果に基づく一括修正

## 前提
- CLAUDE.md を先に読むこと
- AUDIT-RESULT.md の内容に基づいて修正する
- Step 順に実行。各 Step 完了後に `pnpm build` で壊れていないことを確認

---

## Step 1: P0 バグ修正（3件）

### 1a. 「戦略を見る」ボタン修正

ファイル: `components/v2/V2ResultSection.tsx` 138-141行付近

問題: ボタンに onClick/href がない。

修正方針: まず戦略タブの実装状態を確認:
```bash
grep -rn "戦略\|strategy\|Strategy" components/v2/ --include="*.tsx" | head -20
```

- 戦略タブのコンテンツが既に存在する場合 → ボタンに対応するタブ切り替え onClick を実装
- 戦略タブが未実装の場合 → ボタンを削除し、タブから「戦略」自体を除外する（張りぼてを消す）

**未実装の場合の削除方針**: 世界線比較のタブリストから「戦略」を削除。戦略機能は Phase G 以降で実装する。中途半端に残すより、ないほうがマシ。

### 1b. pricing CTA 修正

ファイル: `app/pricing/page.tsx` 115行

```tsx
// Before
href="#"

// After
href="/fit"
```

### 1c. DecisionHost の handleApplyStrategy

ファイル: `components/v2/DecisionHost.tsx` 57-59行

問題: 空スタブ。

修正方針:
```bash
# DecisionHost の使われ方を確認
grep -rn "DecisionHost\|handleApplyStrategy" app/ components/ --include="*.tsx"
```

- DecisionHost が worldline ページで使われているなら → 最低限の実装（世界線を追加するフロー）を入れる
- 使われていないなら → コンポーネント自体を削除

---

## Step 2: P1 カラーパレット統一（最重要のポリッシュ）

### YOHACK カラーマッピング

```
Tailwind gray → YOHACK パレット変換ルール:

テキスト系:
  text-gray-900  → text-[#1A1916]    (Night, 最も濃い)
  text-gray-800  → text-[#5A5550]    (Text, 標準テキスト)
  text-gray-700  → text-[#5A5550]    (Text)
  text-gray-600  → text-[#8A7A62]    (Accent, 補助テキスト)
  text-gray-500  → text-[#8A7A62]    (Accent)
  text-gray-400  → text-[#8A7A62]/60 (Accent, さらに薄い) ← opacity で調整
  text-gray-200  → text-[#C8B89A]/40 (Gold 薄め)
  text-gray-100  → text-[#F0ECE4]    (Linen)

背景系:
  bg-gray-900  → bg-[#1A1916]
  bg-gray-800  → bg-[#1A1916]
  bg-gray-700  → bg-[#5A5550]
  bg-gray-500  → bg-[#8A7A62]
  bg-gray-400  → bg-[#8A7A62]/60
  bg-gray-200  → bg-[#F0ECE4]       (Linen)
  bg-gray-100  → bg-[#FAF9F7]       (BG)
  bg-gray-50   → bg-[#FAF9F7]       (BG)
  bg-white     → bg-white            (変更不要。カード背景は白のまま)

ボーダー系:
  border-gray-200  → border-[#F0ECE4]  (Linen)
  border-gray-300  → border-[#F0ECE4]  (Linen)
  border-gray-700  → border-[#8A7A62]  (Accent)
  border-gray-800  → border-[#5A5550]  (Text)
  border-gray-100  → border-[#F0ECE4]  (Linen)

赤系（危険・警告）:
  text-red-500  → text-red-700        (YOHACK の RED 指定)
  text-red-600  → text-red-700
  text-red-700  → text-red-700        (変更不要)
  bg-red-50     → bg-red-50           (変更不要。薄い背景は許容)
  bg-red-80     → bg-red-50           (存在しないクラス。bg-red-50 に)
  bg-red-100    → bg-red-50
  text-red-100  → text-red-200        (ダーク背景上の赤テキスト)
  border-l-red  → 既存のまま

hover/focus の赤系:
  hover:text-red-700  → 変更不要
  hover:bg-red-50     → 変更不要
  focus:ring-red-400  → focus:ring-red-700
  text-red-300        → text-red-400    (toast の dismiss)
```

### 実行手順

対象ファイル（監査で特定済み）:

```
components/ui/collapsible-card.tsx
components/dashboard/asset-projection-chart.tsx
components/dashboard/cash-flow-card.tsx
components/dashboard/conclusion-summary-card.tsx
components/dashboard/key-metrics-card.tsx
components/dashboard/monte-carlo-simulator-tab.tsx
components/dashboard/next-best-actions-card.tsx
components/dashboard/scenario-comparison-card.tsx
components/v2/ConclusionCard.tsx
components/branch/worldline-preview.tsx
components/branch/event-customize-dialog.tsx
components/plan/rsu-content.tsx
components/ui/toast.tsx
```

**各ファイルで:**
1. `grep -n "gray-\|red-[1-6]" <file>` で該当箇所を確認
2. 上のマッピングテーブルに従って置換
3. 文脈を確認（ダーク背景上のテキストか、ライト背景上か）
4. 置換後にビジュアルが破綻しないか確認

### 注意
- `components/ui/` 配下の shadcn コンポーネント（toast.tsx 以外）は変更しない。shadcn のデフォルトスタイルは Tailwind gray を使っており、全部変えると更新時にコンフリクトする
- `bg-white` はそのまま。カード背景は白
- グラフの凡例色（asset-projection-chart, cash-flow-card）は Recharts のデータ系列色。これはパレットとは別の目的なので、変更する場合は慎重に。ただし `text-gray-500` のようなラベルテキストは変換対象

---

## Step 3: P2 一貫性修正（6件）

### 3a. ページタイトルスタイル統一

全プロダクトページのタイトルを統一:

```
基準: text-xl font-bold tracking-tight text-[#1A1916]
```

修正対象:
```
app/app/page.tsx          — font-semibold → font-bold tracking-tight
app/app/profile/page.tsx  — font-semibold → font-bold tracking-tight
app/app/settings/page.tsx — text-3xl → text-xl
```

`app/app/branch/page.tsx` と `app/app/worldline/page.tsx` は既に基準通りならスキップ。

### 3b. サブタイトル統一

全プロダクトページにサブタイトル（1行の説明文）を統一:

```
基準: text-sm text-[#8A7A62]
```

各画面のサブタイトル:
```
/app          — 「プロファイルとシミュレーション結果」(既存にあれば)
/app/branch   — 「人生の分岐を選び、世界線を自動生成します」(既存)
/app/worldline — 「世界線を並べて比較します」(既存にあれば)
/app/profile  — 「基本情報を入力します」(新規追加)
/app/settings — 「データ管理と設定」(新規追加)
```

### 3c. ページヘッダー sticky 統一

全プロダクトページのヘッダー（タイトル + サブタイトル）を sticky に:

```tsx
<div className="sticky top-0 z-10 bg-[#FAF9F7] pb-3 pt-1">
  <h1 className="text-xl font-bold tracking-tight text-[#1A1916]">タイトル</h1>
  <p className="text-sm text-[#8A7A62]">サブタイトル</p>
</div>
```

ただし、ダッシュボードは ConclusionSummaryCard + タブバーが sticky なので、タイトルの sticky は不要かもしれない。実際の表示を確認して判断。

**原則**: タイトルが画面外に流れて「今どこにいるか」が分からなくなる画面は sticky にする。ダッシュボードのようにタブバーが文脈を示す場合は不要。

### 3d. /app/profile のパンくず

現状の「← ダッシュボードに戻る」は残す。ただしタイトル + サブタイトルを追加:

```tsx
<Link href="/app" className="text-sm text-[#8A7A62] hover:text-[#C8B89A]">
  ← ダッシュボードに戻る
</Link>
<h1 className="text-xl font-bold tracking-tight text-[#1A1916] mt-2">プロファイル</h1>
<p className="text-sm text-[#8A7A62]">基本情報を入力します</p>
```

---

## Step 4: P3 軽微な修正（4件）

### 4a. aria-label 追加

4箇所の展開/折りたたみボタンに aria-label を追加:

```bash
# 対象ファイル
components/dashboard/income-card.tsx:67
components/dashboard/asset-card.tsx:66
components/dashboard/advanced-input-panel.tsx:230
components/dashboard/housing-plan-card.tsx
```

各ボタンに `aria-label="セクションを展開"` を追加。
展開中なら `aria-label="セクションを閉じる"` に動的変更（状態に応じて）。

### 4b. shadow 統一

```
components/dashboard/asset-projection-chart.tsx:84
shadow-lg → shadow-sm
```

### 4c. スペーシング

カード間 `space-y-4` とカード内 `space-y-6` の混在は意図的。変更不要。
ただし CLAUDE.md に以下を追記:

```markdown
### スペーシング規則
- カード間: space-y-4 or gap-4
- カード内（フォーム要素間）: space-y-6（入力フィールドの視覚的分離）
- カード内（情報表示要素間）: space-y-4
```

### 4d. HousingMultiScenarioCard

監査チェックリストの誤記。修正不要。

---

## Step 5: テスト

```bash
pnpm build
pnpm test
```

### 最終確認

```bash
# パレット外の色が残っていないか再確認
grep -rn "text-gray-\|bg-gray-\|border-gray-" app/ components/ --include="*.tsx" | \
  grep -v node_modules | grep -v "ui/" | grep -v "__tests__"

# red-500, red-600 が残っていないか
grep -rn "red-[1-6]00" app/ components/ --include="*.tsx" | \
  grep -v node_modules | grep -v "ui/" | grep -v "red-700\|red-50\|red-200\|red-400"
```

---

## Step 6: コミット

```bash
git add .
git commit -m "fix: 品質監査に基づく一括修正

P0 バグ:
- 「戦略を見る」ボタン修正 or 削除
- /pricing CTA を /fit に修正
- DecisionHost 空スタブ対応

P1 カラー:
- 13ファイルの gray/red をYOHACKパレットに統一
- Night/Text/Accent/Linen/Gold/BG の6色体系に準拠

P2 一貫性:
- ページタイトル text-xl font-bold tracking-tight に統一
- サブタイトル追加（profile, settings）
- ヘッダー sticky 統一

P3 ポリッシュ:
- aria-label 4箇所追加
- shadow-lg → shadow-sm 統一
- CLAUDE.md にスペーシング規則追記"
```
