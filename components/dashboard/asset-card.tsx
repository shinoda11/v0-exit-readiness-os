'use client';

import { useState } from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { SliderInput } from '@/components/slider-input';
import { CurrencyInput } from '@/components/currency-input';
import { FieldError } from '@/components/ui/field-error';
import { formatCurrency } from '@/lib/types';
import type { Profile } from '@/lib/types';

interface AssetCardProps {
  profile: Pick<
    Profile,
    'assetCash' | 'assetInvest' | 'assetDefinedContributionJP' | 'dcContributionAnnual'
  >;
  onUpdate: (updates: Partial<Profile>) => void;
  getFieldError?: (field: string) => string | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AssetCard({ profile, onUpdate, getFieldError, open, onOpenChange }: AssetCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const totalAssets =
    profile.assetCash +
    profile.assetInvest +
    profile.assetDefinedContributionJP;

  const handleTotalChange = (newTotal: number) => {
    const oldTotal = totalAssets;
    if (oldTotal === 0) {
      // All zero: put everything in cash
      onUpdate({ assetCash: newTotal, assetInvest: 0, assetDefinedContributionJP: 0 });
    } else {
      // Pro-rata distribution
      const ratio = newTotal / oldTotal;
      onUpdate({
        assetCash: Math.round(profile.assetCash * ratio),
        assetInvest: Math.round(profile.assetInvest * ratio),
        assetDefinedContributionJP: Math.round(profile.assetDefinedContributionJP * ratio),
      });
    }
  };

  const icon = <Wallet className="h-5 w-5" />;
  const title = '現在の資産';

  const content = (
    <div className="space-y-6">
      {/* Total assets */}
      <div>
        <SliderInput
          label="金融資産合計"
          value={totalAssets}
          onChange={handleTotalChange}
          min={0}
          max={30000}
          step={100}
          unit="万円"
        />
      </div>

      {/* Breakdown toggle */}
      <button
        type="button"
        onClick={() => setShowBreakdown(!showBreakdown)}
        aria-label={showBreakdown ? '内訳を閉じる' : '内訳を展開'}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
        内訳を入力
      </button>

      {showBreakdown && (
        <div className="space-y-4 pl-3 border-l-2 border-muted">
          {/* Cash */}
          <div>
            <CurrencyInput
              label="現預金"
              description="普通・定期預金"
              value={profile.assetCash}
              onChange={(value) => onUpdate({ assetCash: value })}
            />
            <FieldError message={getFieldError?.('assetCash')} />
          </div>

          {/* Investment assets */}
          <div>
            <CurrencyInput
              label="投資資産"
              description="株式・投信・NISA等"
              value={profile.assetInvest}
              onChange={(value) => onUpdate({ assetInvest: value })}
            />
            <FieldError message={getFieldError?.('assetInvest')} />
          </div>

          {/* Defined contribution */}
          <div>
            <CurrencyInput
              label="確定拠出年金"
              description="iDeCo・企業型DC"
              value={profile.assetDefinedContributionJP}
              onChange={(value) => onUpdate({ assetDefinedContributionJP: value })}
            />
            <FieldError message={getFieldError?.('assetDefinedContributionJP')} />
          </div>

          {/* DC annual contribution — slider (users often calculate from monthly) */}
          <SliderInput
            label="DC年間拠出額"
            value={profile.dcContributionAnnual}
            onChange={(value) => onUpdate({ dcContributionAnnual: value })}
            min={0}
            max={100}
            step={1}
            unit="万円"
          />

          {/* Ratio summary */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="grid grid-cols-3 gap-1 text-xs sm:gap-2">
              {(() => {
                if (totalAssets === 0) return (
                  <>
                    <div className="text-center"><div className="font-normal">0%</div><div className="text-muted-foreground">現預金</div></div>
                    <div className="text-center"><div className="font-normal">0%</div><div className="text-muted-foreground">投資</div></div>
                    <div className="text-center"><div className="font-normal">0%</div><div className="text-muted-foreground">DC年金</div></div>
                  </>
                );
                const rawCash = (profile.assetCash / totalAssets) * 100;
                const rawInvest = (profile.assetInvest / totalAssets) * 100;
                const rawDC = (profile.assetDefinedContributionJP / totalAssets) * 100;
                const floored = [Math.floor(rawCash), Math.floor(rawInvest), Math.floor(rawDC)];
                const remainders = [rawCash - floored[0], rawInvest - floored[1], rawDC - floored[2]];
                let diff = 100 - floored.reduce((a, b) => a + b, 0);
                const indices = [0, 1, 2].sort((a, b) => remainders[b] - remainders[a]);
                for (const i of indices) {
                  if (diff <= 0) break;
                  floored[i]++;
                  diff--;
                }
                return (
                  <>
                    <div className="text-center"><div className="font-normal">{floored[0]}%</div><div className="text-muted-foreground">現預金</div></div>
                    <div className="text-center"><div className="font-normal">{floored[1]}%</div><div className="text-muted-foreground">投資</div></div>
                    <div className="text-center"><div className="font-normal">{floored[2]}%</div><div className="text-muted-foreground">DC年金</div></div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (open !== undefined && onOpenChange) {
    const parts: string[] = [];
    if (profile.assetCash > 0) parts.push(`現金${profile.assetCash.toLocaleString()}`);
    if (profile.assetInvest > 0) parts.push(`投資${profile.assetInvest.toLocaleString()}`);
    if (profile.assetDefinedContributionJP > 0) parts.push(`DC${profile.assetDefinedContributionJP.toLocaleString()}`);
    const summary = (
      <>
        {'総資産 '}
        <span className="font-normal text-foreground">{formatCurrency(totalAssets)}</span>
        {parts.length > 0 && `（${parts.join(' / ')}）`}
      </>
    );
    return (
      <CollapsibleCard icon={icon} title={title} summary={summary} open={open} onOpenChange={onOpenChange}>
        {content}
      </CollapsibleCard>
    );
  }

  return (
    <SectionCard icon={icon} title={title} description="現在の資産状況を入力してください">
      {content}
    </SectionCard>
  );
}
