'use client';

import { Briefcase } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { SliderInput } from '@/components/slider-input';
import type { Profile } from '@/lib/types';

interface IncomeCardProps {
  profile: Pick<
    Profile,
    | 'grossIncome'
    | 'rsuAnnual'
    | 'sideIncomeNet'
    | 'mode'
    | 'partnerGrossIncome'
    | 'partnerRsuAnnual'
  >;
  onUpdate: (updates: Partial<Profile>) => void;
}

export function IncomeCard({ profile, onUpdate }: IncomeCardProps) {
  const isCouple = profile.mode === 'couple';

  return (
    <SectionCard
      icon={<Briefcase className="h-5 w-5" />}
      title="収入"
      description="年間の収入を入力してください"
    >
      <div className="space-y-6">
        {/* Gross income */}
        <SliderInput
          label={isCouple ? "あなたの年収" : "年収"}
          description="額面"
          value={profile.grossIncome}
          onChange={(value) => onUpdate({ grossIncome: value })}
          min={0}
          max={5000}
          step={50}
          unit="万円"
        />

        {/* RSU annual */}
        <SliderInput
          label="RSU/株式報酬"
          description="年間付与額"
          value={profile.rsuAnnual}
          onChange={(value) => onUpdate({ rsuAnnual: value })}
          min={0}
          max={3000}
          step={50}
          unit="万円"
        />

        {/* Side income */}
        <SliderInput
          label="副業収入"
          description="手取り"
          value={profile.sideIncomeNet}
          onChange={(value) => onUpdate({ sideIncomeNet: value })}
          min={0}
          max={1000}
          step={10}
          unit="万円"
        />

        {/* Partner income (only for couple mode) */}
        {isCouple && (
          <>
            <div className="border-t pt-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                パートナーの収入
              </p>
            </div>
            <SliderInput
              label="パートナー年収"
              description="額面"
              value={profile.partnerGrossIncome}
              onChange={(value) => onUpdate({ partnerGrossIncome: value })}
              min={0}
              max={5000}
              step={50}
              unit="万円"
            />
            <SliderInput
              label="パートナーRSU"
              description="年間付与額"
              value={profile.partnerRsuAnnual}
              onChange={(value) => onUpdate({ partnerRsuAnnual: value })}
              min={0}
              max={3000}
              step={50}
              unit="万円"
            />
          </>
        )}
      </div>
    </SectionCard>
  );
}
