'use client';

import React from "react"

import { Lightbulb, ArrowRight, Clock, TrendingUp, TrendingDown, PiggyBank, Calendar } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { KeyMetrics, Profile, ExitScoreDetail } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NextAction {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'income' | 'expense' | 'savings' | 'timeline';
  icon: React.ReactNode;
}

interface NextActionsCardProps {
  metrics: KeyMetrics | null;
  score: ExitScoreDetail | null;
  profile: Profile;
  isLoading?: boolean;
  onActionClick?: (actionId: string) => void;
}

function generateActions(
  metrics: KeyMetrics,
  score: ExitScoreDetail,
  profile: Profile
): NextAction[] {
  const actions: NextAction[] = [];

  // If survival rate is low
  if (score.survival < 80) {
    actions.push({
      id: 'delay-retirement',
      title: 'Exit目標年齢を3年延長',
      description: `目標を${profile.targetRetireAge + 3}歳に延長すると、サバイバル率が大幅に改善します`,
      impact: 'high',
      category: 'timeline',
      icon: <Calendar className="h-4 w-4" />,
    });
  }

  // If lifestyle score is low
  if (score.lifestyle < 70) {
    actions.push({
      id: 'reduce-expense',
      title: '生活費を10%削減',
      description: `年間${Math.round(profile.livingCostAnnual * 0.1)}万円の節約で、目標達成が早まります`,
      impact: 'high',
      category: 'expense',
      icon: <TrendingDown className="h-4 w-4" />,
    });
  }

  // If liquidity is low
  if (score.liquidity < 60) {
    actions.push({
      id: 'increase-cash',
      title: '現金比率を増やす',
      description: '緊急時の備えとして、現預金を生活費1年分確保しましょう',
      impact: 'medium',
      category: 'savings',
      icon: <PiggyBank className="h-4 w-4" />,
    });
  }

  // If income could be improved
  if (profile.sideIncomeNet === 0) {
    actions.push({
      id: 'add-side-income',
      title: '副業収入を追加',
      description: '年間50万円の副業収入があれば、目標達成が2年早まる可能性があります',
      impact: 'medium',
      category: 'income',
      icon: <TrendingUp className="h-4 w-4" />,
    });
  }

  // DC contribution check
  if (profile.dcContributionAnnual < 60) {
    actions.push({
      id: 'max-dc',
      title: 'iDeCo/DC拠出を最大化',
      description: '税制優遇を最大限活用し、退職後の資産を効率的に増やせます',
      impact: 'medium',
      category: 'savings',
      icon: <PiggyBank className="h-4 w-4" />,
    });
  }

  // Always add a general tip
  if (actions.length < 3) {
    actions.push({
      id: 'review-regularly',
      title: '定期的に見直し',
      description: '年に1-2回は前提条件を見直し、計画を最新の状況に合わせましょう',
      impact: 'low',
      category: 'timeline',
      icon: <Clock className="h-4 w-4" />,
    });
  }

  return actions.slice(0, 4); // Max 4 actions
}

const impactColors = {
  high: 'border-l-gray-400 bg-gray-50/50',
  medium: 'border-l-gray-300 bg-gray-50/30',
  low: 'border-l-gray-200 bg-gray-50/20',
};

const impactLabels = {
  high: '効果大',
  medium: '効果中',
  low: '参考',
};

export function NextActionsCard({
  metrics,
  score,
  profile,
  isLoading,
  onActionClick,
}: NextActionsCardProps) {
  if (isLoading || !metrics || !score) {
    return (
      <SectionCard
        icon={<Lightbulb className="h-5 w-5" />}
        title="次の一手"
        description="目標達成に向けた推奨アクション"
      >
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </SectionCard>
    );
  }

  const actions = generateActions(metrics, score, profile);

  return (
    <SectionCard
      icon={<Lightbulb className="h-5 w-5" />}
      title="次の一手"
      description="目標達成に向けた推奨アクション"
    >
      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className={cn(
              'rounded-lg border-l-4 p-4 transition-colors',
              impactColors[action.impact]
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-background p-2 text-muted-foreground shadow-sm">
                  {action.icon}
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{action.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    action.impact === 'high' && 'bg-gray-200 text-gray-700',
                    action.impact === 'medium' && 'bg-gray-100 text-gray-600',
                    action.impact === 'low' && 'bg-gray-50 text-gray-500'
                  )}
                >
                  {impactLabels[action.impact]}
                </span>
                {onActionClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => onActionClick(action.id)}
                  >
                    適用 <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
