'use client';

import { TrendingUp } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { SliderInput } from '@/components/slider-input';
import type { Profile } from '@/lib/types';

interface InvestmentCardProps {
  profile: Pick<
    Profile,
    | 'expectedReturn'
    | 'inflationRate'
    | 'volatility'
    | 'effectiveTaxRate'
    | 'retireSpendingMultiplier'
  >;
  onUpdate: (updates: Partial<Profile>) => void;
}

export function InvestmentCard({ profile, onUpdate }: InvestmentCardProps) {
  const realReturn = profile.expectedReturn - profile.inflationRate;

  return (
    <SectionCard
      icon={<TrendingUp className="h-5 w-5" />}
      title="投資設定"
      description="投資リターンとリスクの想定"
    >
      <div className="space-y-6">
        {/* Expected return */}
        <SliderInput
          label="期待リターン"
          description="名目"
          value={profile.expectedReturn}
          onChange={(value) => onUpdate({ expectedReturn: value })}
          min={0}
          max={15}
          step={0.5}
          unit="%"
        />

        {/* Inflation rate */}
        <SliderInput
          label="インフレ率"
          value={profile.inflationRate}
          onChange={(value) => onUpdate({ inflationRate: value })}
          min={0}
          max={5}
          step={0.1}
          unit="%"
        />

        {/* Real return display */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">実質リターン</span>
            <span className="font-semibold">{realReturn.toFixed(1)}%</span>
          </div>
        </div>

        {/* Volatility */}
        <SliderInput
          label="ボラティリティ"
          description="標準偏差"
          value={Math.round(profile.volatility * 100)}
          onChange={(value) => onUpdate({ volatility: value / 100 })}
          min={5}
          max={30}
          step={1}
          unit="%"
        />

        {/* Effective tax rate */}
        <SliderInput
          label="実効税率"
          value={profile.effectiveTaxRate}
          onChange={(value) => onUpdate({ effectiveTaxRate: value })}
          min={10}
          max={50}
          step={1}
          unit="%"
        />

        {/* Retirement spending multiplier */}
        <SliderInput
          label="退職後支出倍率"
          description="現役時比"
          value={Math.round(profile.retireSpendingMultiplier * 100)}
          onChange={(value) => onUpdate({ retireSpendingMultiplier: value / 100 })}
          min={50}
          max={120}
          step={5}
          unit="%"
        />
      </div>
    </SectionCard>
  );
}
