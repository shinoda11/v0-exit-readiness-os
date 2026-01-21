'use client';

import { Receipt } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { SliderInput } from '@/components/slider-input';
import type { Profile } from '@/lib/types';

interface ExpenseCardProps {
  profile: Pick<Profile, 'livingCostAnnual' | 'housingCostAnnual'>;
  onUpdate: (updates: Partial<Profile>) => void;
}

export function ExpenseCard({ profile, onUpdate }: ExpenseCardProps) {
  const totalExpense = profile.livingCostAnnual + profile.housingCostAnnual;

  return (
    <SectionCard
      icon={<Receipt className="h-5 w-5" />}
      title="支出"
      description="年間の支出を入力してください"
    >
      <div className="space-y-6">
        {/* Living cost */}
        <SliderInput
          label="基本生活費"
          description="食費、光熱費、通信費など"
          value={profile.livingCostAnnual}
          onChange={(value) => onUpdate({ livingCostAnnual: value })}
          min={100}
          max={1200}
          step={10}
          unit="万円"
        />

        {/* Housing cost */}
        <SliderInput
          label="住居費"
          description="家賃またはローン返済"
          value={profile.housingCostAnnual}
          onChange={(value) => onUpdate({ housingCostAnnual: value })}
          min={0}
          max={600}
          step={10}
          unit="万円"
        />

        {/* Total summary */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">年間支出合計</span>
            <span className="text-lg font-semibold">
              {totalExpense.toLocaleString()}万円
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            月額: 約{Math.round(totalExpense / 12).toLocaleString()}万円
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
