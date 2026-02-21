# Phase G-2: 世界線比較 UI 再構成

## 前提
- Phase G-1（デッドコード掃除）が完了していること
- CLAUDE.md を先に読むこと
- V2-AUDIT.md の問題点を踏まえた再設計

---

## 現状の問題

5タブ構成だが、中身が薄い:

| タブ | 問題 |
|------|------|
| 余白 | MoneyMargin は実数値。TimeMargin/EnergyMargin は固定値で意味がない |
| 使い道 | 余白配分スライダー。面白いが「世界線比較」との関係が薄い |
| 意思決定 | 住まい/子どもの2択。シミュレーションに反映されない張りぼて |
| 世界線 | シナリオ比較ビュー。これが本来のメイン機能 |
| 戦略 | ルールベースの戦略提案。スコアに応じた固定テンプレート |

## 再構成後の設計

**3タブ** に統合:

### タブ1: 世界線比較（メイン）

現在の「世界線」タブを拡張。ここがメイン機能。

**内容:**
- 世界線カード（現在のV2ComparisonView を維持）
- 各世界線のスコア・資産推移・キャッシュフローの比較
- 差分バッジ（+3点、-15万/月 など）
- 「分岐ビルダーで世界線を追加」ボタン → /app/branch

**変更点:**
- 「意思決定ブリッジ」（住まい/子ども）を削除。分岐ビルダーに統合済み
- 世界線がまだない場合のエンプティステートを改善:
  ```
  まだ世界線がありません。
  分岐ビルダーで最初の世界線を作成しましょう。
  [分岐ビルダーへ →]
  ```

### タブ2: 余白（MoneyMargin のみに集中）

現在の「余白」タブを簡素化。

**内容:**
- MoneyMargin のみ表示（実数値で信頼性がある）
  - 年間可処分所得
  - 月次純貯蓄額
  - 緊急資金カバー月数
  - 各指標の健全性評価（excellent/good/fair/poor）
- 世界線間の余白比較（世界線が2つ以上ある場合）
  - 「世界線Aは月次貯蓄が+5万多い」のような差分表示

**削除するもの:**
- TimeMargin（固定値ベースで信頼性がない）
- EnergyMargin（同上）
- 余白配分スライダー（「使い道」タブの内容）

**将来:**
TimeMargin/EnergyMargin は、ユーザー入力（労働時間、休日数、ストレスレベル等）を追加してから復活させる。今は削っておく。

### タブ3: 戦略

現在の「戦略」タブを維持。ただしヒーローセクションから独立させる。

**内容:**
- 推奨戦略カード（primaryStrategy）
- 戦略的インサイト（SWOT風）
- 緊急アクション（urgentActions）

**変更点:**
- ヒーローセクションの「戦略を見る」ボタンは維持（タブ3に切り替え）
- overallAssessment をヒーローセクションに残す（スコア + キーメッセージ）

---

## 実装

### Step 1: タブ構成の変更

`app/app/worldline/page.tsx` のタブ定義を変更:

```tsx
// Before: 5タブ
const tabs = ['margins', 'allocation', 'decision', 'worldlines', 'strategy'];

// After: 3タブ
const tabs = ['worldlines', 'margins', 'strategy'];
```

タブラベル:
```
世界線比較 | 余白 | 戦略
```

`lib/v2/store.ts` の `activeTab` 型も更新:
```tsx
// Before
activeTab: 'margins' | 'allocation' | 'decision' | 'worldlines' | 'strategy';

// After
activeTab: 'worldlines' | 'margins' | 'strategy';
```

デフォルトタブを `'worldlines'` に変更（現在は `'margins'`）。

### Step 2: 意思決定ブリッジの削除

`V2InputSection.tsx` から renderMode="decision" のセクションを削除。

`lib/v2/store.ts` から:
- `bridges` フィールド
- `setHousingBridge`
- `setChildrenBridge`

を削除（Step 1 の確認で外部参照がないことを確認してから）。

### Step 3: 使い道（allocation）の削除

`V2InputSection.tsx` から renderMode="allocation" のセクションを削除。

`lib/v2/store.ts` から:
- `allocation` フィールド
- `setAllocation`
- `saveAllocationAsScenario` 関連

を削除（外部参照確認後）。

**注意:** `saveAllocationAsScenario` が `lib/store.ts` にある場合、そちらも削除対象。確認:
```bash
grep -rn "saveAllocationAsScenario\|allocation" lib/store.ts
```

### Step 4: 余白タブの簡素化

`V2ResultSection.tsx` の renderMode="margins" セクションを修正:

**削除:**
- TimeMargin の表示カード
- EnergyMargin の表示カード
- 余白トリレンマの3軸レーダーチャート（もしあれば）

**維持・強化:**
- MoneyMargin の表示カード
  - 年間可処分所得: `money.annualDisposableIncome` 万円
  - 月次純貯蓄額: `money.monthlyNetSavings` 万円
  - 緊急資金: `money.emergencyFundCoverage` ヶ月分
  - 健全性: excellent/good/fair/poor のバッジ

**追加:**
- 世界線間の余白比較（世界線が2つ以上ある場合）
  - シンプルなテーブル形式:
    ```
    指標           | 世界線A  | 世界線B  | 差分
    月次貯蓄       | 25万     | 20万     | -5万
    緊急資金       | 14ヶ月   | 8ヶ月    | -6ヶ月
    ```

### Step 5: 世界線比較タブの改善

`V2ComparisonView.tsx` の改善:

**エンプティステート:**
世界線が0本の場合:
```tsx
<div className="text-center py-12">
  <YohackSymbol size={48} color="#C8B89A" />
  <h3 className="text-lg font-bold text-[#1A1916] mt-4">
    まだ世界線がありません
  </h3>
  <p className="text-sm text-[#8A7A62] mt-2">
    分岐ビルダーで異なる選択肢を比較しましょう
  </p>
  <Link href="/app/branch" className="inline-block mt-4 px-4 py-2 bg-[#C8B89A] text-white rounded-lg text-sm">
    分岐ビルダーへ
  </Link>
</div>
```

**1本の場合:**
現在のベースライン表示 + 「もう1本追加して比較する」CTA

**2本以上の場合:**
既存の比較ビューを維持。

### Step 6: ヒーローセクション調整

現在のヒーローセクション（スコアサークル + キーメッセージ）は維持。
ただし以下を調整:

- 「戦略を見る」ボタン → 維持（タブ3に切り替え）
- goalLens セレクター → 削除（store.ts から削除済み）
- readinessConfig の色 → Phase G-1 で修正済み

### Step 7: V2InputSection.tsx の扱い

allocation と decision を削除すると、V2InputSection.tsx が空になる可能性がある。
確認して、空になるならファイルごと削除:

```bash
grep -rn "V2InputSection" app/ components/ --include="*.tsx"
```

---

## Step 8: adapter.ts の整理

TimeMargin / EnergyMargin を余白タブから削除したので、adapter.ts の対応する関数も削除対象:

```
- calculateTimeMargin（固定値ベース、信頼性なし）
- calculateEnergyMargin（固定値ベース、信頼性なし）
```

ただし `calculateMargin` がこれらを呼んでいる場合、`calculateMargin` の戻り値の型（Margin）も変更が必要。

**方針:**
- `Margin` 型を `MoneyMarginOnly` に簡素化するか、既存の `Margin` 型の time/energy フィールドをオプショナルにする
- `useMargin` フックの戻り値から time/energy を除外
- adapter.ts から `calculateTimeMargin` / `calculateEnergyMargin` を削除
- margin.ts から `TimeMargin` / `EnergyMargin` 型と評価関数を削除

---

## Step 9: テスト

```bash
pnpm build
pnpm test
```

世界線比較関連のテストがあれば修正:
```bash
grep -rn "margin\|strategy\|worldline\|allocation\|bridges" lib/__tests__/ --include="*.test.*"
```

### 手動確認（375px + 1024px）

- [ ] `/app/worldline`: 3タブ（世界線比較 / 余白 / 戦略）が表示
- [ ] 世界線比較タブ: エンプティステートが正しく表示
- [ ] 世界線比較タブ: シナリオがあれば比較カードが表示
- [ ] 余白タブ: MoneyMargin のみ表示（Time/Energy なし）
- [ ] 戦略タブ: 推奨戦略 + インサイトが表示
- [ ] ヒーローセクション: スコア + 「戦略を見る」ボタンが動作
- [ ] 「意思決定」「使い道」タブが完全に消えている
- [ ] allocation / bridges / TimeMargin / EnergyMargin への参照が残っていない

---

## Step 10: CLAUDE.md 更新

世界線比較セクションを更新:

```markdown
## 世界線比較 (/app/worldline)

### 3タブ構成
1. **世界線比較** — シナリオ間のスコア・資産推移・キャッシュフロー比較
2. **余白** — MoneyMargin（可処分所得・貯蓄・緊急資金）
3. **戦略** — スコアベースの推奨戦略 + SWOT風インサイト

### データフロー
engine.ts SimResult → adapter.ts → MoneyMargin → 余白タブ
engine.ts SimResult → useStrategy hook → 戦略タブ
lib/store.ts scenarios → V2ComparisonView → 世界線比較タブ

### 削除済み
- 意思決定ブリッジ（住まい/子ども）→ 分岐ビルダーに統合
- 余白配分スライダー（allocation）
- TimeMargin / EnergyMargin（固定値ベース、信頼性不足で一時削除）
```

---

## Step 11: コミット

```bash
git add .
git commit -m "refactor: 世界線比較を5タブ→3タブに再構成

- 意思決定ブリッジ削除（分岐ビルダーに統合済み）
- 余白配分（allocation）削除
- TimeMargin/EnergyMargin 削除（固定値ベースで信頼性不足）
- MoneyMargin に集中した余白タブ
- 世界線比較タブにエンプティステート追加
- V2InputSection 削除 or 簡素化
- adapter.ts/margin.ts から未使用関数削除"
```

---

## 削除行数の見込み（G-1 + G-2 合計）

| Phase | 削除行数 |
|-------|---------|
| G-1 デッドコード | ~1,350行 |
| G-2 タブ削除・簡素化 | ~500行 |
| **合計** | **~1,850行** |

---

## 将来の拡張候補（今回はやらない）
- TimeMargin の復活（ユーザー入力: 週労働時間、有給消化率を追加してから）
- EnergyMargin の復活（ユーザー入力: 健康スコア、ストレスレベルを追加してから）
- 余白配分の復活（世界線比較と連動する形で再設計してから）
- マジックナンバーの定数化（YOHACK_CONSTANTS.ts に集約）
- 戦略タブの強化（シミュレーション連動の「what-if」提案）
