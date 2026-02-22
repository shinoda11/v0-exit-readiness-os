# Phase G-1: v2 デッドコード掃除

## 目的
V2-AUDIT.md で特定されたデッドコード・未使用エクスポート・デッドコンポーネントを削除する。
動作に影響を与えず、コードベースを軽くする。

## 前提
- CLAUDE.md を先に読むこと
- V2-AUDIT.md の 4.4 / 4.5 セクションが根拠
- **削除のみ。新機能追加・リファクタはしない**

---

## Step 1: ファイル単位の削除

以下のファイルはどこからもインポートされていない。丸ごと削除:

```bash
# デッドコンポーネント（5ファイル）
rm components/v2/WorldLineLens.tsx
rm components/v2/NextStepCard.tsx
rm components/v2/EventLayer.tsx
rm components/v2/ConclusionCard.tsx
rm components/v2/ReasonCard.tsx

# デッドフック
rm hooks/useWorldLines.ts

# lib/v2/strategy.ts — hooks/useStrategy.ts と完全重複。hooks 側が使われている
rm lib/v2/strategy.ts

# lib/v2/events.ts — engine.ts と接続なし。Phase F で lib/event-catalog.ts に置き換え済み
rm lib/v2/events.ts
```

削除前に念のため確認:
```bash
# 本当にインポートされていないか最終確認
for f in WorldLineLens NextStepCard EventLayer ConclusionCard ReasonCard useWorldLines; do
  echo "=== $f ==="
  grep -rn "$f" app/ components/ hooks/ lib/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "__tests__"
done

# strategy.ts と events.ts のインポート確認
grep -rn "from.*v2/strategy" app/ components/ hooks/ lib/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
grep -rn "from.*v2/events" app/ components/ hooks/ lib/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

もしインポートしているファイルがあれば、そのインポート行も削除する。

---

## Step 2: 未使用エクスポートの削除（lib/v2/ 残存ファイル内）

### worldline.ts から削除

以下のエクスポートは削除したコンポーネント（WorldLineLens, useWorldLines）のみが使用:

```
- cloneWorldLine（関数）
- addEventToWorldLine（関数）
- removeEventFromWorldLine（関数）
- evaluateKpiHealth（関数）
- compareWorldLines（関数）
- WorldLineComparison（型）
- WorldLineComparisonDetailed（型）
```

削除前に確認:
```bash
for name in cloneWorldLine addEventToWorldLine removeEventFromWorldLine evaluateKpiHealth compareWorldLines WorldLineComparison WorldLineComparisonDetailed; do
  echo "=== $name ==="
  grep -rn "$name" app/ components/ hooks/ lib/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "v2/worldline.ts"
done
```

外部参照がなければ、worldline.ts から該当の関数・型定義を削除。

### worldline.ts が events.ts に依存している場合

events.ts を削除した後、worldline.ts のインポートが壊れる。
`ScenarioEvent` 型の参照を修正する必要がある:
- worldline.ts の WorldLine 型に `events: ScenarioEvent[]` がある場合 → 使われていなければフィールドごと削除。使われていれば型を inline 化するか、別の場所に移す

### adapter.ts の未使用インポート

```
- createDefaultMargin のインポート → 使用されていないので削除
```

### store.ts の未使用フィールド

以下は worldline/page.tsx で使われていない:
```
- showV2UI / toggleV2UI / setShowV2UI
- goalLens / setGoalLens
```

**ただし store.ts のフィールド削除は慎重に。** 他のコンポーネントが使っている可能性がある:
```bash
grep -rn "showV2UI\|goalLens" app/ components/ hooks/ --include="*.tsx" --include="*.ts"
```
外部参照がゼロの場合のみ削除。

---

## Step 3: readinessConfig.ts のカラー修正

V2-AUDIT で指摘: すべてグレー系で視覚的に区別しにくい。

YOHACKパレットに合わせる:
```tsx
export const readinessConfig = {
  excellent:  { label: '万全',     color: 'bg-[#4A7C59]', textColor: 'text-white' },
  ready:      { label: '準備OK',   color: 'bg-[#C8B89A]', textColor: 'text-white' },
  on_track:   { label: '順調',     color: 'bg-[#8A7A62]', textColor: 'text-white' },
  needs_work: { label: '要改善',   color: 'bg-[#5A5550]', textColor: 'text-white' },
  not_ready:  { label: '要対策',   color: 'bg-red-700',   textColor: 'text-white' },
};
```

この変更が他のコンポーネントに影響しないか確認:
```bash
grep -rn "readinessConfig" app/ components/ --include="*.tsx"
```

---

## Step 4: V2ComparisonView の /app/plan リンク修正

V2-AUDIT 4.6 で指摘: `/app/plan` へのリンクが複数箇所にあるが、実態は `/app/branch` へのリダイレクト。

```bash
grep -rn "/app/plan" components/v2/ --include="*.tsx"
```

すべて `/app/branch` に変更。ラベルも「ライフプランでシナリオを作成する」→「分岐ビルダーでシナリオを作成する」に変更。

---

## Step 5: テスト

```bash
pnpm build
pnpm test
```

削除したファイルを参照しているテストがあれば修正:
```bash
grep -rn "WorldLineLens\|NextStepCard\|EventLayer\|ConclusionCard\|ReasonCard\|useWorldLines\|v2/strategy\|v2/events" __tests__/ lib/__tests__/ --include="*.test.*"
```

---

## Step 6: CLAUDE.md 更新

v2 ディレクトリ構造を更新:

```markdown
lib/v2/
  worldline.ts      ← WorldLine 型定義・CRUD（簡素化済み）
  margin.ts         ← 余白トリレンマ型定義・閾値評価
  adapter.ts        ← engine.ts SimResult → v2 Margin/KPI 変換
  store.ts          ← 世界線比較 UI 状態（activeTab, allocation, bridges）
  readinessConfig.ts ← 準備度レベル定義（5段階）

※ 削除済み: strategy.ts（hooks/useStrategy.ts に統合）, events.ts（lib/event-catalog.ts に置き換え）
```

コンポーネント:
```markdown
components/v2/
  V2ResultSection.tsx   ← 余白・戦略の表示
  V2InputSection.tsx    ← 使い道・意思決定の入力
  V2ComparisonView.tsx  ← 世界線比較ビュー
```

---

## Step 7: コミット

```bash
git add .
git commit -m "chore: v2 デッドコード削除

- 8ファイル削除（デッドコンポーネント5、デッドフック1、重複ロジック2）
- worldline.ts の未使用エクスポート削除
- adapter.ts の未使用インポート削除
- store.ts の未使用フィールド削除（確認後）
- readinessConfig.ts をYOHACKパレットに統一
- /app/plan リンクを /app/branch に修正"
```

---

## 削除行数の見込み

| ファイル | 行数 |
|---------|------|
| lib/v2/strategy.ts | 334 |
| lib/v2/events.ts | 259 |
| components/v2/WorldLineLens.tsx | ~150 |
| components/v2/NextStepCard.tsx | ~80 |
| components/v2/EventLayer.tsx | ~120 |
| components/v2/ConclusionCard.tsx | ~150 |
| components/v2/ReasonCard.tsx | ~80 |
| hooks/useWorldLines.ts | ~100 |
| worldline.ts 内の未使用関数 | ~80 |
| **合計** | **~1,350行** |

---

## スコープ外
- 意思決定ブリッジのシミュレーション接続 → Phase G-2
- 5タブの再構成 → Phase G-2
- TimeMargin/EnergyMargin の改善 → Phase G-2
- マジックナンバーの定数化 → Phase G-2
