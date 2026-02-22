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
  completed?: boolean;
}

export function IncomeCard({ profile, onUpdate, getFieldError, open, onOpenChange, completed }: IncomeCardProps) {
  const [showRsu, setShowRsu] = useState(profile.rsuAnnual > 0);
  const icon = <Briefcase className="h-5 w-5" />;
  const title = 'あなたの収入';
  const isCouple = profile.mode === 'couple';

  const content = (
    <div className="space-y-4">
      {/* Gross income */}
      <div>
        <CurrencyInput
          label="年収"
          description="額面"
          value={profile.grossIncome}
          onChange={(value) => onUpdate({ grossIncome: value })}
        />
        <FieldError message={getFieldError?.('grossIncome')} />
      </div>

      {/* RSU toggle + input */}
      {!showRsu ? (
        <button
          type="button"
          onClick={() => setShowRsu(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className="h-3 w-3" />
          RSU / 株式報酬がある場合
        </button>
      ) : (
        <CurrencyInput
          label="RSU / 株式報酬（年間）"
          description="権利確定ベース"
          value={profile.rsuAnnual}
          onChange={(value) => onUpdate({ rsuAnnual: value })}
        />
      )}

      {/* Side income */}
      <CurrencyInput
        label="副業収入"
        description="手取り"
        value={profile.sideIncomeNet}
        onChange={(value) => onUpdate({ sideIncomeNet: value })}
      />

      {/* Partner income (couple mode only) */}
      {isCouple && (
        <div className="space-y-4 pt-2 border-t border-muted">
          <div className="text-sm font-normal text-muted-foreground">パートナーの収入</div>
          <div>
            <CurrencyInput
              label="パートナーの年収"
              description="額面"
              value={profile.partnerGrossIncome}
              onChange={(value) => onUpdate({ partnerGrossIncome: value })}
            />
            <FieldError message={getFieldError?.('partnerGrossIncome')} />
          </div>
          <CurrencyInput
            label="パートナーのRSU / 株式報酬（年間）"
            description="権利確定ベース"
            value={profile.partnerRsuAnnual}
            onChange={(value) => onUpdate({ partnerRsuAnnual: value })}
          />
        </div>
      )}
    </div>
  );

  if (open !== undefined && onOpenChange) {
    const parts: string[] = [];
    parts.push(`年収 ${formatCurrency(profile.grossIncome)}`);
    if (profile.rsuAnnual > 0) parts.push(`RSU ${formatCurrency(profile.rsuAnnual)}`);
    if (profile.sideIncomeNet > 0) parts.push(`副業 ${formatCurrency(profile.sideIncomeNet)}`);
    if (isCouple && profile.partnerGrossIncome > 0) parts.push(`配偶者 ${formatCurrency(profile.partnerGrossIncome)}`);
    const summary = (
      <span className="font-normal text-foreground">{parts.join(' / ')}</span>
    );
    return (
      <CollapsibleCard icon={icon} title={title} summary={summary} open={open} onOpenChange={onOpenChange} completed={completed}>
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
