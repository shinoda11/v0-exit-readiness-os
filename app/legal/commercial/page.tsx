'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function PendingField() {
  return (
    <span className="text-sm text-muted-foreground">
      準備中 — お問い合わせは support@yohack.app まで
    </span>
  );
}

export default function CommercialPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Link>

        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold">特定商取引法に基づく表記</h1>
        </div>

        {/* テーブル */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal w-[40%]">販売事業者</td>
                <td className="px-4 py-3">
                  <PendingField />
                </td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">運営統括責任者</td>
                <td className="px-4 py-3">
                  <PendingField />
                </td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">所在地</td>
                <td className="px-4 py-3">
                  <PendingField />
                </td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">電話番号</td>
                <td className="px-4 py-3">
                  <PendingField />
                </td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">メールアドレス</td>
                <td className="px-4 py-3 text-muted-foreground">support@yohack.app</td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">販売価格</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="space-y-1">
                    <div>Pro プラン 月額: 2,980円（税込）</div>
                    <div>Pro プラン 年額: 29,800円（税込）</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">支払方法</td>
                <td className="px-4 py-3 text-muted-foreground">クレジットカード</td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">支払時期</td>
                <td className="px-4 py-3 text-muted-foreground">お申込み時に即時決済</td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">商品の引渡し時期</td>
                <td className="px-4 py-3 text-muted-foreground">決済完了後、即時ご利用いただけます</td>
              </tr>
              <tr>
                <td className="bg-muted/50 px-4 py-3 font-normal">返品・キャンセル</td>
                <td className="px-4 py-3 text-muted-foreground">
                  デジタルサービスのため返品はお受けできません。
                  解約はいつでも可能で、解約後は次回更新日までサービスをご利用いただけます。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 注記 */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            本表記は一般的な SaaS サービスの特定商取引法表記テンプレートに基づいて作成されたものであり、法的助言を構成するものではありません。
          </p>
        </div>
      </div>
    </main>
  );
}
