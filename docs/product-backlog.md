# YOHACK プロダクトバックログ
> 最終更新: 2026-02-22
> 粒度: Claude Codeにそのまま渡せるレベルで記載

---

## ✅ 完了済み（2026-02-22）

| タスク | 変更ファイル | 結果 |
|---|---|---|
| IncomeCard RSU・パートナー収入フィールド追加 | components/dashboard/income-card.tsx +55行 | 252/252 passed |
| イベントアイコン26件 絵文字→Lucide + カテゴリ左ボーダー | lib/event-catalog.ts / components/branch/event-icon.tsx（新規）/ event-picker-dialog.tsx / event-customize-dialog.tsx | 絵文字残存ゼロ |
| LP S2 決断連鎖シナリオ差し替え | app/page.tsx | 6,000万 vs 8,000万 → 転職 → 教育費 |

---

## 🔴 P0 — 次に着手（優先度順）

---

### P0-FG-1: FitGate 招待トークン欄を条件付き表示に変更

**対象:** `app/fit/page.tsx`（フォーム末尾）

**現状の問題:** 招待トークン欄が全ユーザーに常時表示。「一見さんお断り」戦略と矛盾。

**変更内容:**
```tsx
// URLパラメータがある場合のみ表示
const searchParams = useSearchParams();
const hasToken = searchParams.get('token');

{hasToken && (
  <div className="pt-4 border-t">
    <label>招待トークン</label>
    <Input defaultValue={hasToken} {...register('token')} />
  </div>
)}
```

**完了条件:**
- `/fit` → トークン欄が表示されない
- `/fit?token=ALPHA-2025` → トークン欄が表示され値がプリセットされている

---

### P0-FG-2: FitGateヘッダーに「← 戻る」リンク追加

**対象:** `app/fit/layout.tsx`

**変更内容:**
```tsx
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// ヘッダー左側に追加
<Link
  href="/"
  className="text-xs text-[#8A7A62] flex items-center gap-1 hover:text-[#5A5550] transition-colors"
>
  <ChevronLeft className="w-3 h-3" />
  戻る
</Link>
```

**完了条件:** FitGate画面ヘッダー左上に「← 戻る」が表示され、クリックでLPへ遷移する。

---

### P0-FG-3: Ready判定画面の「無料で〜」テキスト削除 + 文言修正

**対象:** `app/fit/result/page.tsx`（Ready表示部分）

**変更内容:**
```tsx
// Before
<p>無料でシミュレーションをお試しください</p>

// After
<p>YOHACKでシミュレーションを開始できます</p>
{/* TODO Phase2: ここにStripe Checkout ボタンが入る */}
{/* <Button onClick={handleStripeCheckout}>Passを購入する（¥29,800）</Button> */}
<Button asChild>
  <Link href="/?from=fitgate">シミュレーションを開始する →</Link>
</Button>
```

**完了条件:** Ready画面に「無料」という文言が一切含まれていない。

---

### P0-FG-4: FitGate回答 → ダッシュボードプロファイル自動プリセット 動作確認・修正

**対象:** `lib/fitgate.ts`（`fitGateToProfile()`）/ `app/page.tsx`（プリセット読み込み）

**確認手順:**
1. `/fit?token=ALPHA-2025` にアクセスし12問を回答
2. Ready判定 →「シミュレーションを開始する」でダッシュボードへ遷移
3. IncomeCard・AssetCard の値を確認

**期待する挙動（変換テーブル）:**

| FitGate回答 | プロファイルフィールド | 変換値 |
|---|---|---|
| 世帯年収 2,000〜2,499万 | grossIncome | 2200 |
| 年齢 35〜39歳 | currentAge | 37 |
| 家賃 20〜25万 | housingCostAnnual | 264（月22万×12） |
| 検討物件 7,000〜9,999万 | housingPlans[0].price | 8500 |
| 金融資産 2,000〜4,999万 | assetCash + assetInvest | 1050 + 2450（3:7按分） |
| 家族構成「夫婦」 | mode | couple |

**動作しない場合の確認:**
```bash
# fitGateToProfile() に渡るデータをログ確認
# saveFitGateAnswers() と loadFitGateAnswers() のlocalStorageキー名が一致しているか確認
grep -n "fitgate\|fitGate\|FITGATE" lib/fitgate.ts | head -20
```

**完了条件:** FitGate回答後にダッシュボードへ遷移すると、年収・家賃・資産の3項目が正しい値でプリセットされている。

---

### P0-FG-5: Prep判定後のメール登録を最低限機能させる

**対象:** `app/api/prep-register/route.ts`（新規）/ `app/fit/result/page.tsx`

**APIルート（新規）:**
```tsx
// app/api/prep-register/route.ts
export async function POST(req: Request) {
  const { email, fitgateAnswers } = await req.json();
  // TODO Phase2: Supabase prepModeSubscribers テーブルに保存
  // TODO Phase2: SendGrid でレター送信
  console.log('[Prep登録]', email, JSON.stringify(fitgateAnswers), new Date().toISOString());
  return Response.json({ ok: true });
}
```

**Prep画面のフォーム:**
```tsx
const [email, setEmail] = useState('');
const [submitted, setSubmitted] = useState(false);

const handleSubmit = async () => {
  await fetch('/api/prep-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, fitgateAnswers: loadFitGateAnswers() }),
  });
  setSubmitted(true);
};

{submitted
  ? <p className="text-sm text-[#8A7A62]">登録しました。条件が整いましたらご連絡します。</p>
  : (
    <div className="flex gap-2">
      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
      <Button onClick={handleSubmit}>登録する</Button>
    </div>
  )
}
```

**完了条件:**
- Prep判定後にメールアドレスを入力して送信できる
- 送信後に完了メッセージが表示される
- `pnpm dev` のログに `[Prep登録]` が出力される

---

### P0-1: LP Y字アニメーション高速化

**対象:** `app/page.tsx`（S0セクション内 CSS animation 定義）

**変更後:**
```css
.y-svg .stem  { animation: draw 0.5s ease forwards 0.1s; }
.y-svg .left  { animation: draw 0.4s ease forwards 0.4s; }
.y-svg .right { animation: draw 0.4s ease forwards 0.4s; }
.y-svg .node  { animation: appear 0.2s ease forwards 0.7s; }
.y-svg .dot-l { animation: appear 0.2s ease forwards 0.75s; }
.y-svg .dot-r { animation: appear 0.2s ease forwards 0.8s; }
```

**完了条件:** ページリロード後、Y字の枝が0.4s以内に見え始める。

---

### P0-2: LP → FitGate 導線接続（UTMパラメータ付き）

**対象:** `app/page.tsx`（LPのCTAボタン2箇所）

```tsx
// S0 ヒーローCTA
<a href="/fit?utm_source=lp&utm_medium=hero_cta" className="cta-btn ...">
  12問で確認する
</a>

// S5 ボトムCTA
<a href="/fit?utm_source=lp&utm_medium=bottom_cta" className="cta-btn ...">
  12問で確認する
</a>
```

**完了条件:** クリックで `/fit?utm_source=lp&utm_medium=...` に遷移する。

---

## 🟡 P1 — 今週中

### P1-1: LP グラフプレビューをシナリオ連動に修正

**対象:** `app/page.tsx`（S2内のSVGグラフ）

世界線A（6,000万）パス:
```tsx
d="M0,140 C80,120 160,90 240,70 S360,45 480,35 S560,30 600,28"
```

世界線B（8,000万）パス:
```tsx
d="M0,140 C80,130 160,122 240,118 S320,115 380,118 S480,125 600,138"
stroke="#CC3333" strokeWidth="2" fill="none" strokeDasharray="8 5"
```

安心ラインラベル:
```tsx
<text x="8" y="97" fontSize="9" fill="#8A7A62" fontFamily="DM Mono">安心ライン</text>
```

スコア:
```tsx
// A: <div className="score-value safe">78</div> / 転職後も安心ライン上
// B: <div style={{ color: '#CC3333' }}>54</div> / 42歳の転職断念で下落
```

### P1-2: モバイルLP 375px確認・修正

| 確認箇所 | 崩れていた場合の修正 |
|---|---|
| S0 Y字 中央寄せ | `flex justify-center` を親に追加 |
| S2 2列比較 | `grid-cols-1 sm:grid-cols-2` に変更 |
| 文字サイズ | `text-[10px]` → `text-xs`（12px）に引き上げ |
| スクロールアニメ | `threshold: 0.1` → `threshold: 0.05` に下げる |

---

## 🟢 P2 — 来週以降

### P2-1: LP Next.js本実装
- `app/(marketing)/lp/page.tsx` に切り出し
- Framer Motion で CSS animation を置換
- `app/page.tsx` をダッシュボードのみに戻す

### P2-2: チラ見せ動画（15秒）撮影・埋め込み
- 年収スライダー → グラフ変化のキャプチャ
- 数字はダミーデータ
- LP S0に埋め込み、`autoPlay loop muted playsInline`

### P2-3: ケース台帳LP展開（6ケース）
- C01〜C18 + C19（6,000万 vs 8,000万）から6件選定
- LP S3 を `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` に拡張

### P2-4: 1on1裏メニュー表示ロジック
- トリガー: 世界線3本以上 OR Pass購入から60日経過
- 表示場所: `/worldline` ページ末尾
- 一度閉じたら再表示しない（localStorage）

### P2-5: Stripe Checkout接続（Phase 2）
- Ready判定 → Stripe Checkout → ¥29,800 Pass購入 → アクセス権付与
- `passSubscriptions` テーブル（Supabase）
- Webhook: `checkout.session.completed` → Pass有効化

### P2-6: Supabase導入（Phase 2）
- 認証: Supabase Auth
- テーブル: fitGateResponses / passSubscriptions / prepModeSubscribers
- localStorage → Supabase DB への移行

---

## 未解決の問い

| # | 問い | 判断者 |
|---|---|---|
| Q1 | 物件6,000万〜8,000万はDINKS（世帯年収1,500〜2,500万）に「自分ごと」に感じるか？ | Toshiya |
| Q2 | S0の背景色: ダーク（#1A1916）維持か、オフホワイト（#FAF9F7）統一か？ | Toshiya |
| Q3 | グラフスコア参考値（78/54）をLPに出すか、完全ぼかしか？ | Toshiya |
| Q4 | S2シナリオ: 夫婦1組に絞るか、「夫婦」「ソロ」2パターンか？ | Toshiya |
| Q5 | アルファテスター10名への周知タイミングと通知方法 | Toshiya |
| Q6 | FitGate通過後、Stripe接続までの間（現Phase1）はどこで¥29,800を案内するか？ | Toshiya |
