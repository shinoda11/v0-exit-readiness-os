'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
          <p className="text-sm text-muted-foreground mt-2">
            最終更新日: 2025年2月15日
          </p>
        </div>

        {/* 1. 収集する情報 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. 収集する情報</h2>

          <h3 className="text-sm font-medium">現在の状況</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスは、現在、ユーザーの個人情報をサーバーに送信・保存していません。
            すべてのプロファイルデータおよびシミュレーション結果は、
            お使いのブラウザのローカルストレージにのみ保存されます。
          </p>

          <h3 className="text-sm font-medium mt-4">将来的に収集する可能性のある情報</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            アカウント機能の導入に伴い、以下の情報を収集する場合があります。
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1.5 ml-2">
            <li>アカウント情報（メールアドレス、表示名）</li>
            <li>プロファイルデータ（シミュレーション用の入力情報）</li>
            <li>支払い情報（クレジットカード情報は Stripe が直接処理し、当社では保持しません）</li>
            <li>利用状況データ（アクセスログ、機能の利用頻度）</li>
          </ul>
        </section>

        {/* 2. 利用目的 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. 利用目的</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            収集した情報は、以下の目的で利用します。
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1.5 ml-2">
            <li>本サービスの提供および維持</li>
            <li>サービスの改善および新機能の開発</li>
            <li>ユーザーサポートの提供</li>
            <li>利用状況の分析（匿名化したうえで）</li>
            <li>重要なお知らせや更新情報の通知</li>
          </ul>
        </section>

        {/* 3. 第三者提供 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. 第三者提供</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ユーザーの個人情報を、本人の同意なく第三者に提供することは原則として行いません。
            ただし、以下のサービス提供者に業務委託する場合があります。
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1.5 ml-2">
            <li><span className="font-medium text-foreground">Stripe</span> — 決済処理（クレジットカード情報の安全な処理）</li>
            <li><span className="font-medium text-foreground">Vercel</span> — ホスティングおよびアクセス解析</li>
            <li><span className="font-medium text-foreground">Supabase</span> — 将来のデータベースおよび認証基盤</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            また、法令に基づく開示請求があった場合は、必要な範囲で情報を提供する場合があります。
          </p>
        </section>

        {/* 4. Cookie */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Cookie およびアクセス解析</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本サービスでは、Vercel Analytics によるアクセス解析を行っています。
            これにより、匿名化されたアクセスデータ（ページビュー、訪問者数等）を収集しています。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vercel Analytics はプライバシーに配慮した設計であり、
            個人を特定する Cookie は使用していません。
          </p>
        </section>

        {/* 5. データの保存期間 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. データの保存期間</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ローカルストレージに保存されたデータは、ユーザーがブラウザのデータを削除するか、
            本サービスの設定画面からリセットするまで保持されます。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            将来的にサーバー側にデータを保存する場合、
            アカウント削除後は合理的な期間内にデータを削除します。
            ただし、法令上の義務がある場合は、必要な期間保持する場合があります。
          </p>
        </section>

        {/* 6. ユーザーの権利 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. ユーザーの権利</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ユーザーは、以下の権利を有します。
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1.5 ml-2">
            <li>保有する個人情報の開示を請求する権利</li>
            <li>個人情報の訂正・追加・削除を請求する権利</li>
            <li>個人情報の利用停止を請求する権利</li>
            <li>アカウントおよびデータの削除を請求する権利</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            これらの請求は、下記のお問い合わせ先までご連絡ください。
          </p>
        </section>

        {/* 7. お問い合わせ */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. お問い合わせ</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            プライバシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
          </p>
          <p className="text-sm font-medium">
            support@yohack.app
          </p>
        </section>

        {/* 注記 */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            本プライバシーポリシーは一般的な SaaS サービスのテンプレートに基づいて作成されたものであり、法的助言を構成するものではありません。
          </p>
        </div>
      </div>
    </main>
  );
}
