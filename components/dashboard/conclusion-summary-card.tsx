'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import type { ExitScoreDetail, KeyMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

type Status = 'GREEN' | 'YELLOW' | 'RED' | 'CALCULATING';

interface ConclusionSummaryCardProps {
  score: ExitScoreDetail | null;
  metrics: KeyMetrics | null;
  isLoading: boolean;
  targetRetireAge: number;
  // Goal Lens前提
  workStyle?: string;
  legacyGoal?: string;
}

function getStatus(score: ExitScoreDetail | null): Status {
  if (!score) return 'CALCULATING';
  if (score.overall >= 70) return 'GREEN';
  if (score.overall >= 40) return 'YELLOW';
  return 'RED';
}

function getStatusConfig(status: Status) {
  // Semantic colors using Tailwind standard classes
  switch (status) {
    case 'GREEN':
      return {
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textColor: 'text-emerald-800 dark:text-emerald-200',
        icon: CheckCircle2,
      };
    case 'YELLOW':
      return {
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-300 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-800 dark:text-amber-200',
        icon: AlertTriangle,
      };
    case 'RED':
      return {
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        borderColor: 'border-red-300 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-800 dark:text-red-200',
        icon: XCircle,
      };
    case 'CALCULATING':
    default:
      return {
        bgColor: 'bg-secondary',
        borderColor: 'border-border',
        iconColor: 'text-muted-foreground',
        textColor: 'text-muted-foreground',
        icon: Loader2,
      };
  }
}

// 3行固定フォーマット: 結論 / 理由(ボトルネック) / 次の一手(Income/Cost/Timing)
type ActionType = 'Income' | 'Cost' | 'Timing';

// 効果量の目安を算出（軽量計算、既存metricsから推定）
function estimateEffect(
  actionType: ActionType,
  metrics: KeyMetrics,
  gap: number | null
): string {
  // 断定を避け、レンジ表現 + 「目安」「前提で変わる」を必ず添える
  const disclaimer = '（前提で変わります）';
  
  if (actionType === 'Income') {
    // 収入+200万/年 → 年間貯蓄が増え、FIRE年齢が1-2年早まる目安
    const yearsEffect = gap && gap > 0 ? Math.min(Math.ceil(gap / 3), 3) : 1;
    return `手取り+200万/年で目標が${yearsEffect}〜${yearsEffect + 1}年早まる目安${disclaimer}`;
  }
  
  if (actionType === 'Cost') {
    // 支出-10%で生存率が5-10%改善する目安
    const survivalGap = 90 - metrics.survivalRate;
    if (survivalGap <= 0) {
      return `支出見直しで余裕がさらに広がる目安${disclaimer}`;
    }
    const rateEffect = Math.min(Math.ceil(survivalGap / 2), 10);
    return `支出-10%で安心度が${rateEffect}〜${rateEffect + 5}pt改善する目安${disclaimer}`;
  }
  
  if (actionType === 'Timing') {
    // 目標+2年で生存率が5-15%改善する目安
    if (gap && gap > 0) {
      return `目標を2年延ばすと達成確度が上がる目安${disclaimer}`;
    }
    return `変化は小さめ。現状維持で問題なし${disclaimer}`;
  }
  
  return `効果は前提により異なります`;
}

function generateConclusion(
  status: Status,
  score: ExitScoreDetail | null,
  metrics: KeyMetrics | null,
  targetRetireAge: number
): { 
  stateLine: string;      // 1行目: 現状の評価（ポジティブ・断定しない）
  actionLine: string;     // 2行目: 次にやること（Top1）
  actionType: ActionType; // Income/Cost/Timing
  effectEstimate: string; // 効果量の目安（1行）
  detailText: string;     // 折りたたみ用の詳細
} {
  if (!score || !metrics) {
    return {
      stateLine: 'シミュレーション中です',
      actionLine: '',
      actionType: 'Timing',
      effectEstimate: '',
      detailText: '',
    };
  }

  const fireAge = metrics.fireAge;
  const survivalRate = metrics.survivalRate;
  const gap = fireAge ? fireAge - targetRetireAge : null;

  // ボトルネック特定
  const scores = {
    survival: score.survival,
    lifestyle: score.lifestyle,
    risk: score.risk,
    liquidity: score.liquidity,
  };
  const weakest = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b);
  const bottleneck = weakest[0];

  if (status === 'GREEN') {
    const actionType: ActionType = 'Timing';
    return {
      stateLine: gap && gap < 0 
        ? `目標より${Math.abs(gap)}年の余裕がありそうです`
        : `現在のペースで目標達成が見えています`,
      actionLine: '今のまま続けてみましょう',
      actionType,
      effectEstimate: estimateEffect(actionType, metrics, gap),
      detailText: '想定外の出費にも対応できる余白があります。支出を増やすか、目標を前倒しする選択肢もあります。',
    };
  }

  if (status === 'YELLOW') {
    let actionLine = '';
    let actionType: ActionType = 'Cost';
    let detailText = '';
    let stateLine = '目標に近づいています';

    if (bottleneck === 'survival') {
      stateLine = 'もう少しで安心ラインに届きそうです';
      actionLine = 'まずは貯蓄率を少し上げてみる';
      actionType = gap && gap > 0 ? 'Timing' : 'Income';
      detailText = '毎月の貯蓄額を増やすか、働く期間を延ばすことで改善できます。どちらを選ぶかはあなた次第です。';
    } else if (bottleneck === 'lifestyle') {
      stateLine = '支出バランスを整えると安心度が上がりそうです';
      actionLine = '退職後の支出を一度見直してみる';
      actionType = 'Cost';
      detailText = '退職後の生活費を見直すことで、安心ラインが上がります。';
    } else if (bottleneck === 'risk') {
      stateLine = '資産配分を調整すると安定感が増しそうです';
      actionLine = '安定資産の比率を検討してみる';
      actionType = 'Cost';
      detailText = '株式100%から債券や現金を混ぜることで、悲観シナリオが改善します。';
    } else {
      stateLine = '手元資金を増やすと安心感が高まりそうです';
      actionLine = '生活費6ヶ月分を目安に確保してみる';
      actionType = 'Cost';
      detailText = '緊急時に備えて、すぐ使える資金を確保しましょう。';
    }

    return { 
      stateLine, 
      actionLine, 
      actionType, 
      effectEstimate: estimateEffect(actionType, metrics, gap),
      detailText 
    };
  }

  // RED - ポジティブなトーンで行動を促す
  const actionType: ActionType = 'Income';
  return {
    stateLine: '調整すれば改善の余地があります',
    actionLine: gap && gap > 0 
      ? 'まずは収入か目標時期を見直してみる' 
      : '貯蓄ペースを上げる方法を探ってみる',
    actionType,
    effectEstimate: estimateEffect(actionType, metrics, gap),
    detailText: 'いくつかの選択肢があります。どの手を打つかは、あなたの価値観と状況で決めてください。',
  };
}

export function ConclusionSummaryCard({
  score,
  metrics,
  isLoading,
  targetRetireAge,
  workStyle = '会社員',
  legacyGoal = '使い切り',
}: ConclusionSummaryCardProps) {
  // ローディング中でも前の値を保持してちらつきを防ぐ
  const displayStatus = useMemo(() => {
    if (!score) return 'CALCULATING';
    return getStatus(score);
  }, [score]);
  
  const config = getStatusConfig(displayStatus);
  
  const { stateLine, actionLine, actionType, effectEstimate, detailText } = useMemo(
    () => generateConclusion(displayStatus, score, metrics, targetRetireAge),
    [displayStatus, score, metrics, targetRetireAge]
  );

  // アクションタイプのラベル
  const actionTypeLabel = {
    Income: '収入',
    Cost: '支出',
    Timing: '時期',
  }[actionType];

  return (
    <Card className={cn('border relative', config.bgColor, config.borderColor)}>
      {/* 計算中インジケータ */}
      {isLoading && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>更新中</span>
        </div>
      )}
      <CardContent className="p-5">
        {/* Goal Lens前提（1行） */}
        <p className="text-xs text-gray-400 mb-3">
          前提: {workStyle} / {legacyGoal} / {targetRetireAge}歳目標
        </p>
        
        {/* 2行固定フォーマット */}
        <div className="space-y-3">
          {/* 1行目: 現状の評価 */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-base text-foreground leading-snug">
              {stateLine}
            </p>
            {score && (
              <span className={cn(
                "text-xl font-bold tabular-nums px-2.5 py-0.5 rounded-lg shrink-0 self-start sm:self-auto",
                score.overall >= 70 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                score.overall >= 40 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                isLoading && "opacity-50"
              )}>
                {score.overall.toFixed(0)}
              </span>
            )}
          </div>
          
          {/* 2行目: 次にやること（Top1） */}
          {actionLine && (
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                {actionLine}
              </p>
            </div>
          )}
        </div>
        
        {/* 詳細は折りたたみ */}
        {(detailText || effectEstimate) && (
          <details className="mt-3 pt-3 border-t border-border">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              詳しく見る
            </summary>
            <div className="mt-2 space-y-1">
              {effectEstimate && (
                <p className="text-xs text-muted-foreground">
                  {effectEstimate}
                </p>
              )}
              {detailText && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {detailText}
                </p>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
