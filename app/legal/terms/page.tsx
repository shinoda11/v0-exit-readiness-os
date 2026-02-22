'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 戻るリンク */}
        <Link
          href="/lp"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Link>

        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold">利用規約</h1>
          <p className="text-sm text-muted-foreground mt-2">
            最終更新日: 2025年2月15日
          </p>
        </div>

        {/* 1. 本サービスについて */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. 本サービスについて</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            YOHACK（以下「本サービス」）は、人生設計のシミュレーションツールです。
            お金・時間・体力の「余白」を可視化し、住宅購入・キャリア・家族計画などの意思決定を支援することを目的としています。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスは投資助言、ファイナンシャルプランニング、税務相談、その他の専門的なアドバイスを提供するものではありません。
            シミュレーション結果はあくまで参考情報であり、具体的な投資判断や人生の重要な決定については、
            必ず専門家にご相談ください。
          </p>
        </section>

        {/* 2. アカウント */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. アカウント</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            現在、本サービスはアカウント登録なしでご利用いただけます。
            データはお使いのブラウザのローカルストレージに保存されます。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            将来的にアカウント登録機能を導入する場合があります。
            その際は、正確な情報を提供していただく必要があります。
            アカウントの管理責任はユーザーご自身にあります。
          </p>
        </section>

        {/* 3. 料金と支払い */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. 料金と支払い</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスには無料プラン（Free）と有料プラン（Pro）があります。
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1.5 ml-2">
            <li>Pro プランの料金は月額2,980円（税込）または年額29,800円（税込）です。</li>
            <li>支払いはクレジットカードによる自動決済です。</li>
            <li>解約はいつでも可能です。解約後も、現在の請求期間の終了まで Pro 機能をご利用いただけます。</li>
            <li>料金の変更は、30日前までに通知いたします。</li>
          </ul>
        </section>

        {/* 4. 免責事項 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. 免責事項</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスのシミュレーション結果は、入力されたパラメータに基づく統計的な推計値であり、
            将来の収益、資産額、その他の結果を保証するものではありません。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            投資、住宅購入、退職、キャリア変更、その他の重要な意思決定は、
            すべてユーザーご自身の責任で行ってください。
            本サービスの利用によって生じたいかなる損害についても、運営者は責任を負いません。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスは「現状有姿」で提供されます。
            運営者は、サービスの正確性、完全性、信頼性、適合性について、
            明示または黙示を問わず、いかなる保証も行いません。
          </p>
        </section>

        {/* 5. 知的財産権 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. 知的財産権</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスに含まれるすべてのコンテンツ（テキスト、デザイン、ロゴ、ソフトウェア、アルゴリズム等）の
            著作権およびその他の知的財産権は、運営者に帰属します。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ユーザーは、本サービスの利用に必要な範囲で個人的にコンテンツを利用できますが、
            無断での複製、転載、再配布、商用利用は禁止します。
          </p>
        </section>

        {/* 6. 禁止事項 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. 禁止事項</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ユーザーは、以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1.5 ml-2">
            <li>法令または公序良俗に反する行為</li>
            <li>本サービスの不正利用、サーバーへの過負荷行為</li>
            <li>本サービスのリバースエンジニアリング、逆アセンブル、逆コンパイル</li>
            <li>他のユーザーまたは第三者に不利益を与える行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        {/* 7. サービスの変更・終了 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. サービスの変更・終了</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            運営者は、事前に通知のうえ、本サービスの内容を変更、
            または本サービスの提供を終了する場合があります。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            サービスの終了に際しては、有料プランのユーザーに対して
            合理的な期間の事前通知を行います。
            サービスの変更・終了によって生じた損害について、運営者は責任を負いません。
          </p>
        </section>

        {/* 8. 準拠法と管轄 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">8. 準拠法と管轄</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本規約の解釈および適用は、日本法に準拠します。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        {/* 注記 */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            本利用規約は一般的な SaaS サービスの規約テンプレートに基づいて作成されたものであり、法的助言を構成するものではありません。
          </p>
        </div>
      </div>
    </main>
  );
}
