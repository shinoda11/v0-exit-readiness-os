'use client';

import { useState } from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { CurrencyInput } from '@/components/currency-input';
import { FieldError } from '@/components/ui/field-error';
import { formatCurrency } from '@/lib/types';
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
  getFieldError?: (field: string) => string | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IncomeCard({ profile, onUpdate, getFieldError, open, onOpenChange }: IncomeCardProps) {
  const isCouple = profile.mode === 'couple';
  const hasExtraIncome = profile.rsuAnnual > 0 || profile.sideIncomeNet > 0 || (isCouple && profile.partnerRsuAnnual > 0);
  const [showExtra, setShowExtra] = useState(hasExtraIncome);
  const icon = <Briefcase className="h-5 w-5" />;
  const title = '収入';

  const content = (
    <div className="space-y-4">
      {/* Gross income */}
      <div>
        <CurrencyInput
          label={isCouple ? "あなたの年収" : "年収"}
          description="額面"
          value={profile.grossIncome}
          onChange={(value) => onUpdate({ grossIncome: value })}
        />
        <FieldError message={getFieldError?.('grossIncome')} />
      </div>

      {/* Partner income (only for couple mode) - always visible */}
      {isCouple && (
        <CurrencyInput
          label="パートナー年収"
          description="額面"
          value={profile.partnerGrossIncome}
          onChange={(value) => onUpdate({ partnerGrossIncome: value })}
        />
      )}

      {/* RSU/Side income toggle */}
      <button
        type="button"
        onClick={() => setShowExtra(!showExtra)}
        aria-label={showExtra ? 'RSU・副業収入を閉じる' : 'RSU・副業収入を展開'}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${showExtra ? 'rotate-180' : ''}`} />
        RSU・副業収入を入力
      </button>

      {showExtra && (
        <div className="space-y-4 pl-3 border-l-2 border-muted">
          {/* RSU annual */}
          <CurrencyInput
            label="RSU/株式報酬"
            description="年間付与額"
            value={profile.rsuAnnual}
            onChange={(value) => onUpdate({ rsuAnnual: value })}
          />

          {/* Side income */}
          <CurrencyInput
            label="副業収入"
            description="手取り"
            value={profile.sideIncomeNet}
            onChange={(value) => onUpdate({ sideIncomeNet: value })}
          />

          {/* Partner RSU (only for couple mode) */}
          {isCouple && (
            <CurrencyInput
              label="パートナーRSU"
              description="年間付与額"
              value={profile.partnerRsuAnnual}
              onChange={(value) => onUpdate({ partnerRsuAnnual: value })}
            />
          )}
        </div>
      )}
    </div>
  );

  if (open !== undefined && onOpenChange) {
    const summary = (
      <>
        <span className="font-medium text-foreground">年収 {formatCurrency(profile.grossIncome)}</span>
        {profile.rsuAnnual > 0 && ` / RSU ${formatCurrency(profile.rsuAnnual)}`}
        {profile.sideIncomeNet > 0 && ` / 副業 ${formatCurrency(profile.sideIncomeNet)}`}
        {isCouple && ` / パートナー ${formatCurrency(profile.partnerGrossIncome)}`}
      </>
    );
    return (
      <CollapsibleCard icon={icon} title={title} summary={summary} open={open} onOpenChange={onOpenChange}>
        {content}
      </CollapsibleCard>
    );
  }

  return (
    <SectionCard icon={icon} title={title} description="年間の収入を入力してください">
      {content}
    </SectionCard>
  );
}
