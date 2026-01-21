'use client';

import React from "react"

import { Gauge, Calendar, PiggyBank, ShieldCheck } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { KeyMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

interface KeyMetricsCardProps {
  metrics: KeyMetrics | null;
  currentAge: number;
  targetRetireAge: number;
  isLoading?: boolean;
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  highlight?: 'success' | 'warning' | 'danger' | 'neutral';
}

function MetricItem({
  icon,
  label,
  value,
  subValue,
}: MetricItemProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 items-center justify-center text-gray-400">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-gray-400">{subValue}</p>
        )}
      </div>
    </div>
  );
}

export function KeyMetricsCard({
  metrics,
  currentAge,
  targetRetireAge,
  isLoading,
}: KeyMetricsCardProps) {
  // 初回ロード時のみスケルトン表示、以降は前の値を保持
  if (!metrics) {
    return (
      <SectionCard
        icon={<Gauge className="h-5 w-5" />}
        title="主要指標"
        description="シミュレーション結果のサマリー"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </SectionCard>
    );
  }

  // Determine goal feasibility - use fireAge (not goalAge which doesn't exist)
  const goalAgeText = metrics.fireAge
    ? `${metrics.fireAge}歳`
    : '達成困難';
  const yearsToGoalText = metrics.yearsToFire
    ? `あと${metrics.yearsToFire}年`
    : undefined;
  const goalHighlight =
    metrics.fireAge && metrics.fireAge <= targetRetireAge
      ? 'success'
      : metrics.fireAge
        ? 'warning'
        : 'danger';

  // Determine survival rate color
  const survivalHighlight =
    metrics.survivalRate >= 90
      ? 'success'
      : metrics.survivalRate >= 70
        ? 'warning'
        : 'danger';

  // Format asset at 100
  const assetAt100Text =
    metrics.assetAt100 >= 0
      ? `${metrics.assetAt100.toLocaleString()}万円`
      : `${Math.abs(metrics.assetAt100).toLocaleString()}万円の不足`;
  const assetHighlight = metrics.assetAt100 >= 0 ? 'success' : 'danger';

  // Years until target retirement
  const yearsUntilTarget = targetRetireAge - currentAge;

  return (
    <SectionCard
      icon={<Gauge className="h-5 w-5" />}
      title="主要指標"
      description="シミュレーション結果のサマリー"
      action={isLoading && <span className="text-xs text-gray-400">更新中...</span>}
    >
      <div className={cn("grid gap-2 md:grid-cols-2 divide-y md:divide-y-0", isLoading && "opacity-60")}>
        <MetricItem
          icon={<Calendar className="h-5 w-5" />}
          label="目標達成可能年齢"
          value={goalAgeText}
          subValue={yearsToGoalText}
        />
        <MetricItem
          icon={<ShieldCheck className="h-5 w-5" />}
          label="サバイバル率"
          value={`${metrics.survivalRate.toFixed(1)}%`}
          subValue="資産が尽きない確率"
        />
        <MetricItem
          icon={<PiggyBank className="h-5 w-5" />}
          label="100歳時点の資産"
          value={assetAt100Text}
          subValue="中央値シナリオ"
        />
        <MetricItem
          icon={<Gauge className="h-5 w-5" />}
          label="目標まで"
          value={`${yearsUntilTarget}年`}
          subValue={`${targetRetireAge}歳で達成目標`}
        />
      </div>
    </SectionCard>
  );
}
