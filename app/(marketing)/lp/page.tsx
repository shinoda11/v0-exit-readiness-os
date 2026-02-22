import type { Metadata } from 'next'
import { LPContent } from './lp-content'

export const metadata: Metadata = {
  title: 'YOHACK - 人生に、余白を。',
  description: '余白（お金・時間・体力）で人生の選択を比較する。安心ラインと世界線比較で、住宅・キャリア・家族の意思決定を「次の一手」まで導きます。',
  openGraph: {
    title: 'YOHACK — 人生の選択肢を世界線で比較する',
    description: 'この家を買ったあと、年収が20%下がっても、まだ動けるか。世界線比較で確認する。',
    url: 'https://yohack.jp/lp',
  },
}

export default function LPPage() {
  return <LPContent />
}
