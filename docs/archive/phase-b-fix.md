# Phase B-fix: 旧ダッシュボード完全復元

## 背景
Phase B で / のダッシュボードを解体してしまった。これは誤り。
正しくは「旧ダッシュボードはそのまま維持し、/branch を新機能として追加する」だった。

## やること

### 1. app/page.tsx を旧ダッシュボードに完全復元

Phase B の前の app/page.tsx（525行）の構成を復元する。git log で Phase B1 直前のコミットを特定し、app/page.tsx をそこから復元する:

```bash
# Phase B1 直前のコミットを見つける
git log --oneline | head -20

# app/page.tsx を復元
git checkout <Phase-A完了時のコミットハッシュ> -- app/page.tsx
```

復元後の app/page.tsx の構成（確認用）:

```
旧ダッシュボード構成（525行）:
├─ WelcomeDialog（4ステップオンボーディングウィザード）
├─ OnboardingSteps バナー
├─ ProfileCompleteness
├─ First-visit バナー（サンプルデータ通知）
├─ ConclusionSummaryCard（結論サマリー + 世界線テンプレート導線）
├─ 3カラムグリッド:
│  ├─ 左カラム（入力カード群）:
│  │  ├─ BasicInfoCard
│  │  ├─ IncomeCard
│  │  ├─ ExpenseCard
│  │  ├─ AssetCard
│  │  ├─ HousingPlanCard
│  │  ├─ InvestmentCard
│  │  └─ AdvancedInputPanel
│  └─ 右カラム（結果タブ）:
│     ├─ ExitReadinessCard
│     ├─ KeyMetricsCard
│     ├─ CashFlowCard
│     ├─ AssetProjectionChart
│     ├─ HousingMultiScenarioCard
│     ├─ ScenarioComparisonCard
│     ├─ NextBestActionsCard
│     └─ MonteCarloSimulatorTab
```

復元後、以下のコンポーネントが app/page.tsx から正しく import されているか確認:
- useSimulation フック
- useProfileStore（profile, updateProfile, resetProfile, saveScenario, scenarios）
- useValidation
- 全 dashboard コンポーネント
- WelcomeDialog
- OnboardingSteps
- ProfileCompleteness
- worldlineTemplates（ConclusionSummaryCard の世界線テンプレート導線）

### 2. app/profile/page.tsx の扱い

**削除しない。** ダッシュボードと /profile の両方から入力できる状態にしておく。
ただし /profile は副次的な入力経路。メインはダッシュボードの左カラム。

/profile のヘッダーに「← ダッシュボードに戻る」リンクを追加。

### 3. app/branch/page.tsx — そのまま維持

B2 で作った分岐ビルダーはそのまま。これがアドオンの本体。

### 4. app/worldline/page.tsx — そのまま維持

旧 /v2 の内容。リダイレクトも維持（/v2 → /worldline）。

### 5. ナビゲーション更新

**サイドバー:**
```
ダッシュボード     /        ← 旧ダッシュボード（復元）
分岐ビルダー      /branch   ← NEW（アドオン）
世界線比較        /worldline ← 旧 /v2 のリネーム
プロファイル      /profile   ← 入力の別経路
───
ライフプラン      /plan → /branch にリダイレクト
設定             /settings
料金             /pricing
```

**ボトムナビ（モバイル）:**
```
ホーム    /          ← ダッシュボード
分岐     /branch     ← 分岐ビルダー
比較     /worldline  ← 世界線比較
設定     /settings
```

### 6. ダッシュボードから /branch への導線

ConclusionSummaryCard の世界線テンプレートセクションに、/branch への導線を追加:

既存の世界線テンプレートボタン群（買う vs 借りる、転職する vs 現職、等）の下に:
```
──────────
もっと詳しく分岐を設計したい場合:
[分岐ビルダーを使う →]  ← /branch へのリンク
```

これは追加のみ。既存のテンプレートボタン群は変更しない。

### 7. テスト

```bash
pnpm build
pnpm test
```

確認項目:
```
[ ] / がダッシュボードとして表示される（入力カード + 結果タブ）
[ ] / で WelcomeDialog が初回訪問時に表示される
[ ] / で入力値を変更するとシミュレーションが自動実行される
[ ] / の ConclusionSummaryCard に世界線テンプレートが表示される
[ ] / から世界線テンプレートを選ぶと /worldline に遷移する
[ ] /branch が分岐ビルダーとして表示される
[ ] /worldline が世界線比較として表示される
[ ] /profile がプロファイル入力として表示される
[ ] /v2 が /worldline にリダイレクトされる
[ ] /plan が /branch にリダイレクトされる
[ ] ボトムナビ・サイドバーのリンクが正しい
[ ] モバイルで横揺れが発生しない
```

### 注意事項
- lib/store.ts は B2 で追加した selectedBranchIds, customBranches, addScenarioBatch はそのまま残す（/branch で使用）
- lib/branch.ts もそのまま残す
- components/branch/* もそのまま残す
- git checkout で復元するのは app/page.tsx のみ。他は現状維持。
- 復元後、app/page.tsx 内の import パスが現在のファイル構造と合っているか確認（Phase A で追加した overflow-x-hidden 等は globals.css 側なので影響なし）
