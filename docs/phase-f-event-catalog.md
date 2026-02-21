# Phase F: 分岐ビルダーにライフイベントの豊かさを復元する

## 背景
Phase B で `components/plan/timeline-content.tsx`（1627行）を削除した。
この中には 26種のプリセットイベント、3種のバンドル、カスタムイベント編集があった。
現在の分岐ビルダーは `lib/branch.ts` の `createDefaultBranches()` で生成された固定リスト（約10個）をチェックボックスで選ぶだけ。張りぼて感が強い。

**目的**: 旧 timeline-content の豊かさを分岐ビルダーに統合し、「自分のシナリオを自由に設計できる」体験を復元する。

## 前提
- CLAUDE.md を先に読むこと
- 削除されたコードは git で復元可能: `git show acd34a9^:components/plan/timeline-content.tsx`
- ただし丸ごと復元するのではなく、分岐ビルダーの UX に合わせて再構成する
- 決定木 SVG（2eb6c37 で実装済み）は維持する

---

## Step 0: 旧コードの復元・参照

```bash
# 削除前のコードを参照用に取り出す（コミットはしない）
git show acd34a9^:components/plan/timeline-content.tsx > /tmp/timeline-content-reference.tsx

# 中身を確認（プリセット定義、バンドル定義、UI構造）
cat /tmp/timeline-content-reference.tsx
```

以下の3つを抽出する:
1. **プリセットイベント定義**（26種、4カテゴリ）
2. **バンドルプリセット定義**（3種）
3. **イベント編集UI**（年齢・金額・期間のカスタマイズ）

---

## Step 1: イベントカタログの作成

新規ファイル: `lib/event-catalog.ts`

旧 timeline-content.tsx のプリセット定義を移植して、独立したデータファイルにする。

### 構造

```tsx
import { LifeEvent } from './types';

// カテゴリ定義
export type EventCategory = 'family' | 'career' | 'lifestyle' | 'asset' | 'housing';

export interface PresetEvent {
  id: string;
  name: string;
  category: EventCategory;
  description: string;          // 1行の説明
  icon: string;                 // emoji
  defaultEvent: Partial<LifeEvent>;  // デフォルト値（年齢・金額・期間）
  customizable: {               // カスタマイズ可能なフィールド
    age?: boolean;
    amount?: boolean;
    duration?: boolean;
  };
}

export interface BundlePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  events: Partial<LifeEvent>[];  // 複数イベントのセット
}

// 26種のプリセット（旧 timeline-content から移植）
export const EVENT_PRESETS: PresetEvent[] = [
  // family
  { id: 'marriage', name: '結婚式', category: 'family', icon: '💍', ... },
  { id: 'child-1', name: '第一子', category: 'family', icon: '👶', ... },
  { id: 'child-2', name: '第二子', category: 'family', icon: '👶', ... },
  { id: 'private-school', name: '私立学校', category: 'family', icon: '🎓', ... },
  { id: 'parent-care', name: '親の介護', category: 'family', icon: '🏥', ... },
  // career
  { id: 'promotion', name: '昇進', category: 'career', icon: '📈', ... },
  { id: 'job-change', name: '転職', category: 'career', icon: '🔄', ... },
  { id: 'expat', name: '海外駐在', category: 'career', icon: '✈️', ... },
  { id: 'side-business', name: '副業', category: 'career', icon: '💼', ... },
  { id: 'partner-leave', name: 'パートナー育休', category: 'career', icon: '👨‍👧', ... },
  { id: 'pace-down', name: 'ペースダウン', category: 'career', icon: '🐢', ... },
  // lifestyle
  { id: 'world-trip', name: '世界一周', category: 'lifestyle', icon: '🌍', ... },
  { id: 'relocation', name: '地方移住', category: 'lifestyle', icon: '🏡', ... },
  { id: 'car', name: '車購入', category: 'lifestyle', icon: '🚗', ... },
  { id: 'renovation', name: 'リフォーム', category: 'lifestyle', icon: '🔨', ... },
  // asset
  { id: 'inheritance', name: '相続', category: 'asset', icon: '📜', ... },
  { id: 'housing-gift', name: '住宅資金贈与', category: 'asset', icon: '🎁', ... },
  { id: 'severance', name: '退職金', category: 'asset', icon: '💰', ... },
  // housing
  { id: 'housing-purchase', name: '住宅購入', category: 'housing', icon: '🏠', ... },
  // ... 残りは旧コードから移植
];

// 3種のバンドル
export const BUNDLE_PRESETS: BundlePreset[] = [
  {
    id: 'expat-owned',
    name: '海外駐在（持ち家あり）',
    description: '駐在手当 + 住居費補助 + 自宅賃貸収入',
    icon: '✈️🏠',
    events: [ /* 旧コードから移植 */ ],
  },
  {
    id: 'expat-rental',
    name: '海外駐在（賃貸）',
    description: '駐在手当 + 住居費補助',
    icon: '✈️',
    events: [ /* 旧コードから移植 */ ],
  },
  {
    id: 'childcare-leave',
    name: '育休→時短→フル復帰',
    description: '育休 + 時短勤務 + 出産費用',
    icon: '👶→👨‍👧→💼',
    events: [ /* 旧コードから移植 */ ],
  },
];

// カテゴリのメタ情報
export const CATEGORIES: Record<EventCategory, { label: string; icon: string }> = {
  family: { label: '家族', icon: '👨‍👩‍👧' },
  career: { label: 'キャリア', icon: '💼' },
  lifestyle: { label: 'ライフスタイル', icon: '🌈' },
  asset: { label: '資産', icon: '💰' },
  housing: { label: '住宅', icon: '🏠' },
};
```

### 重要
- `LifeEvent` 型は `lib/types.ts` に定義されている。互換性を確認すること
- 旧コードの金額・期間のデフォルト値はそのまま移植する
- `lib/v2/events.ts` の EventType とは別系統（v2 は UI 表示専用）。event-catalog.ts は engine.ts の LifeEvent 型に合わせる

---

## Step 2: イベント追加ダイアログ

新規ファイル: `components/branch/event-picker-dialog.tsx`

### UI 構成

shadcn/ui の Dialog を使用:

```
┌─────────────────────────────────────┐
│  イベントを追加                   ✕ │
├─────────────────────────────────────┤
│ [家族] [キャリア] [生活] [資産] [住宅] │  ← カテゴリタブ
├─────────────────────────────────────┤
│                                     │
│  💍 結婚式                          │
│     一時支出 300万                   │
│                                [+]  │
│                                     │
│  👶 第一子                          │
│     年間支出 +100万 × 22年          │
│                                [+]  │
│                                     │
│  🎓 私立学校                        │
│     年間支出 +50万 × 12年           │
│                                [+]  │
│  ...                                │
│                                     │
├─────────────────────────────────────┤
│  📦 バンドル                        │
│                                     │
│  ✈️🏠 海外駐在（持ち家あり）        │
│       駐在手当 + 住居費補助 + ...   │
│                                [+]  │
│  ...                                │
└─────────────────────────────────────┘
```

### 実装ポイント
- カテゴリタブは `flex overflow-x-auto no-scrollbar`（モバイル対応）
- 各プリセットは1タップで「不確定」カテゴリに追加される
- 追加時にカスタマイズダイアログ（Step 3）を挟む
- バンドルはタブの下に別セクションで表示
- 既に追加済みのイベントはグレーアウト + 「追加済み」ラベル

### トリガー
分岐ビルダーの「＋ カスタムイベントを追加」ボタン（現在 disabled）を有効化し、このダイアログを開く。
ボタンのラベルを「＋ イベントを追加」に変更。

---

## Step 3: イベントカスタマイズ

新規ファイル: `components/branch/event-customize-sheet.tsx`

### UI 構成

イベントを追加した直後、またはチェックリストの既存イベントをタップしたときに表示:

shadcn/ui の Sheet（ボトムシート）を使用（モバイル向き）:

```
┌─────────────────────────────────────┐
│  👶 第一子                          │
├─────────────────────────────────────┤
│                                     │
│  開始年齢        [  35  ] 歳        │  ← NumberInput or Slider
│                                     │
│  年間支出        [ 100  ] 万円      │
│                                     │
│  期間            [  22  ] 年        │
│                                     │
│  確度            (計画 / 不確定)     │  ← SegmentedControl
│                                     │
├─────────────────────────────────────┤
│  [保存]                    [削除]    │
└─────────────────────────────────────┘
```

### 実装ポイント
- カスタマイズ可能なフィールドは PresetEvent.customizable で定義
- 年齢は profile.currentAge 以上の値のみ許可
- 「確度」は 計画（ベースラインに含む）/ 不確定（分岐条件になる）の2択
- 住宅購入イベントの場合は purchaseDetails（物件価格、頭金、ローン年数）のフィールドも表示
- 「削除」でイベントを分岐リストから除去

---

## Step 4: lib/branch.ts の拡張

### 現状
`createDefaultBranches()` が固定リスト（約10個）を返す。

### 変更

```tsx
// lib/branch.ts に追加

// プリセットイベントを Branch 型に変換
export function presetToBranch(preset: PresetEvent, customValues?: Partial<LifeEvent>): Branch {
  return {
    id: `preset-${preset.id}-${Date.now()}`,
    label: preset.name,
    detail: formatEventDetail(preset, customValues),
    certainty: 'uncertain',  // デフォルトは不確定。カスタマイズで変更可能
    lifeEvent: { ...preset.defaultEvent, ...customValues },
  };
}

// バンドルを複数の Branch に展開
export function bundleToBranches(bundle: BundlePreset): Branch[] {
  return bundle.events.map((event, i) => ({
    id: `bundle-${bundle.id}-${i}-${Date.now()}`,
    label: `${bundle.name} (${i + 1}/${bundle.events.length})`,
    detail: formatEventDetail(event),
    certainty: 'uncertain',
    lifeEvent: event,
  }));
}
```

### store.ts の更新
`lib/store.ts` に以下を追加（既存の `customBranches` を活用）:

```tsx
// addCustomBranch がまだなければ追加
addCustomBranch: (branch: Branch) => void;
removeCustomBranch: (branchId: string) => void;
updateCustomBranch: (branchId: string, updates: Partial<Branch>) => void;
```

既に `customBranches` と `addScenarioBatch` がストアにあるはず（Phase B で追加）。
まず現在のストアの状態を確認してから、必要なアクションだけ追加する。

---

## Step 5: 分岐ビルダー UI の統合

### ファイル
`app/app/branch/page.tsx`（235行）
`components/branch/branch-category.tsx`（78行）
`components/branch/branch-node.tsx`（44行）

### 変更内容

1. **「＋ カスタムイベントを追加」→「＋ イベントを追加」に変更、disabled を解除**
2. **ボタンクリックで EventPickerDialog を開く**
3. **追加されたイベントが「不確定」カテゴリに表示される**
4. **各イベントのチェックボックス横にタップ領域を追加 → EventCustomizeSheet を開く**
5. **決定木 SVG（branch-tree-viz.tsx）は変更なし** — 既存の不確定イベントリストから自動的に分岐が生成される

### UX フロー
```
分岐ビルダー画面
  │
  ├─ [＋ イベントを追加] → EventPickerDialog
  │    ├─ カテゴリから選ぶ → EventCustomizeSheet（年齢・金額カスタマイズ）→ 追加
  │    └─ バンドルから選ぶ → 複数イベントが一括追加
  │
  ├─ チェックリストの既存イベントをタップ → EventCustomizeSheet（編集）
  │
  ├─ チェック状態の変更 → 決定木 SVG がリアルタイム更新
  │
  └─ [世界線を生成する] → 世界線候補リスト（既存フロー）
```

---

## Step 6: テスト

```bash
pnpm build
pnpm test
```

### 手動確認

- [ ] 「＋ イベントを追加」ボタンが有効、タップでダイアログが開く
- [ ] カテゴリタブ切り替えでプリセットが表示される
- [ ] プリセットの [+] タップでカスタマイズシートが開く
- [ ] 年齢・金額を変更して「保存」で不確定カテゴリに追加される
- [ ] バンドル選択で複数イベントが一括追加される
- [ ] 追加されたイベントのチェックを入れると決定木 SVG に分岐が増える
- [ ] 既存イベントをタップするとカスタマイズシートが開く（編集）
- [ ] カスタマイズシートの「削除」でイベントが除去される
- [ ] 既に追加済みのプリセットがダイアログでグレーアウトされる
- [ ] モバイル（375px）でダイアログ・シートが正しく表示、横スクロールなし
- [ ] デスクトップでも動作する
- [ ] 「世界線を生成する」ボタンの既存フローが壊れていない

---

## Step 7: CLAUDE.md 更新

分岐ビルダーセクションを更新:

```markdown
## 分岐ビルダー

### イベントカタログ (`lib/event-catalog.ts`)
- 26種のプリセットイベント（5カテゴリ: family/career/lifestyle/asset/housing）
- 3種のバンドルプリセット（海外駐在×2、育休復帰）
- engine.ts の LifeEvent 型と互換

### UI構成（3ステップ）
1. **select**: 決定木SVG + カテゴリ別チェックリスト + 「イベントを追加」ダイアログ
2. **customize**: イベントごとの年齢・金額・期間カスタマイズ（ボトムシート）
3. **preview**: 世界線候補リスト（スコア + 差分バッジ）→ `/app/worldline` に遷移
```

---

## Step 8: コミット

```bash
git add .
git commit -m "feat: Phase F — 分岐ビルダーにライフイベントの豊かさを復元

- lib/event-catalog.ts: 26プリセット + 3バンドル（旧timeline-contentから移植）
- EventPickerDialog: カテゴリ別プリセット選択 + バンドル選択
- EventCustomizeSheet: 年齢・金額・期間のカスタマイズ
- lib/branch.ts: presetToBranch / bundleToBranches 変換関数
- 「カスタムイベントを追加」ボタン有効化
- 既存の決定木SVG・世界線生成フローは維持"
```

---

## スコープ外（今回やらない）
- lib/v2/events.ts との統合（v2 は UI 表示専用の別系統。将来的に event-catalog.ts に統合する可能性はあるが今回はスキップ）
- イベントの並び替え（ドラッグ&ドロップ）
- イベントの確率設定（「70% の確率で起きる」のような重み付け）
- プリセットの追加（26種で十分。ユーザーフィードバック後に拡張）
