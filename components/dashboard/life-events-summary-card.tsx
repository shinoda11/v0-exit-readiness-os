'use client';

import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { useProfileStore } from '@/lib/store';
import { getBranchDisplayItems, type BranchDisplayItem } from '@/lib/branch';
import type { Profile, LifeEventType } from '@/lib/types';
import { useMemo } from 'react';

const CERTAINTY_LABEL: Record<string, string> = {
  confirmed: '確定',
  planned: '計画',
  uncertain: '不確定',
};

interface LifeEventsSummaryCardProps {
  profile: Profile;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LifeEventsSummaryCard({ profile, open, onOpenChange }: LifeEventsSummaryCardProps) {
  const { customBranches, hiddenDefaultBranchIds, activeScenarioId } = useProfileStore();

  // シナリオロード中は profile.lifeEvents を表示、それ以外は分岐ビルダー由来
  const isScenarioLoaded = !!activeScenarioId;
  const scenarioEvents = profile.lifeEvents;

  const branchItems = useMemo(
    () => getBranchDisplayItems(profile, customBranches, hiddenDefaultBranchIds),
    [profile, customBranches, hiddenDefaultBranchIds]
  );

  const icon = <CalendarDays className="h-5 w-5" />;
  const title = 'ライフイベント';

  // シナリオ由来の場合
  if (isScenarioLoaded && scenarioEvents.length > 0) {
    const count = scenarioEvents.length;
    const summaryNode = scenarioEvents.map(e => `${e.name}（${e.age}歳）`).join('、');

    const content = (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          シナリオ由来: {count}件のイベント
        </p>
        <div className="space-y-1">
          {scenarioEvents.slice(0, 5).map(e => (
            <div
              key={e.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="flex-shrink-0">{EVENT_ICONS[e.type] ?? '📋'}</span>
              <span className="truncate">{e.name}{e.target === 'partner' ? ' (パートナー)' : ''}</span>
              <span className="tabular-nums flex-shrink-0">{e.age}歳</span>
            </div>
          ))}
          {count > 5 && (
            <p className="text-xs text-muted-foreground pl-6">
              他{count - 5}件
            </p>
          )}
        </div>
        <Link href="/app/branch" className="block">
          <p className="text-sm text-[#C8B89A] hover:underline pt-1">
            分岐ビルダーで編集する
            <ArrowRight className="inline h-3.5 w-3.5 ml-0.5" />
          </p>
        </Link>
      </div>
    );

    if (open !== undefined && onOpenChange) {
      return (
        <CollapsibleCard icon={icon} title={title} summary={summaryNode} open={open} onOpenChange={onOpenChange}>
          {content}
        </CollapsibleCard>
      );
    }

    return (
      <SectionCard icon={icon} title={title}>
        {content}
      </SectionCard>
    );
  }

  // 分岐ビルダー由来の表示
  const count = branchItems.length;
  const planned = branchItems.filter(b => b.certainty === 'planned');
  const uncertain = branchItems.filter(b => b.certainty === 'uncertain');

  const summaryNode = count === 0
    ? '未設定'
    : branchItems.slice(0, 3).map(b => `${b.label}${b.age ? `（${b.age}歳）` : ''}`).join('、');

  const content = (
    <>
      {count === 0 ? (
        <Link href="/app/branch" className="block">
          <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            分岐ビルダーで将来の計画を追加しましょう
            <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
          </p>
        </Link>
      ) : (
        <div className="space-y-2">
          {/* 計画イベント */}
          {planned.length > 0 && (
            <div className="space-y-1">
              {planned.map(b => (
                <BranchItemRow key={b.id} item={b} />
              ))}
            </div>
          )}

          {/* 不確定イベント */}
          {uncertain.length > 0 && (
            <div className="space-y-1">
              {planned.length > 0 && <div className="border-t my-1" />}
              {uncertain.map(b => (
                <BranchItemRow key={b.id} item={b} showCertainty />
              ))}
            </div>
          )}

          {/* リンク */}
          <Link href="/app/branch" className="block">
            <p className="text-sm text-[#C8B89A] hover:underline pt-1">
              分岐ビルダーで編集する
              <ArrowRight className="inline h-3.5 w-3.5 ml-0.5" />
            </p>
          </Link>
        </div>
      )}
    </>
  );

  if (open !== undefined && onOpenChange) {
    return (
      <CollapsibleCard icon={icon} title={title} summary={summaryNode} open={open} onOpenChange={onOpenChange}>
        {content}
      </CollapsibleCard>
    );
  }

  return (
    <Link href="/app/branch" className="block">
      <SectionCard
        icon={icon}
        title={title}
        className="border-dashed cursor-pointer hover:bg-muted/30 transition-colors"
      >
        {content}
      </SectionCard>
    </Link>
  );
}

// LifeEvent icons (for scenario-loaded display)
const EVENT_ICONS: Record<LifeEventType, string> = {
  income_increase: '📈',
  income_decrease: '📉',
  expense_increase: '💸',
  expense_decrease: '✂️',
  asset_gain: '🎁',
  housing_purchase: '🏠',
  asset_purchase: '🏠',
  child_birth: '👶',
  education: '🎓',
  retirement_partial: '🌴',
  rental_income: '🏠',
};

function BranchItemRow({ item, showCertainty }: { item: BranchDisplayItem; showCertainty?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex-shrink-0">{item.icon}</span>
      <span className="truncate">
        {item.label}
        {showCertainty && (
          <span className="text-xs text-[#8A7A62] ml-1">
            （{CERTAINTY_LABEL[item.certainty] ?? item.certainty}）
          </span>
        )}
      </span>
      {item.age && (
        <span className="tabular-nums flex-shrink-0 ml-auto">{item.age}歳</span>
      )}
    </div>
  );
}
