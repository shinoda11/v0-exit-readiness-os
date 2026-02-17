'use client';

import type { Branch, BranchCertainty } from '@/lib/branch';
import { BranchNode } from './branch-node';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORY_META: Record<BranchCertainty, { symbol: string; label: string; description: string }> = {
  confirmed: {
    symbol: '◆',
    label: '確定',
    description: '自動的に反映されます',
  },
  planned: {
    symbol: '●',
    label: '計画',
    description: '実現を前提としたイベント',
  },
  uncertain: {
    symbol: '◌',
    label: '不確定',
    description: '起こるかもしれない未来',
  },
};

interface BranchCategoryProps {
  certainty: BranchCertainty;
  branches: Branch[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onAddEvent?: () => void;
  onEditBranch?: (branch: Branch) => void;
}

export function BranchCategory({
  certainty,
  branches,
  selectedIds,
  onToggle,
  onAddEvent,
  onEditBranch,
}: BranchCategoryProps) {
  if (branches.length === 0) return null;

  const meta = CATEGORY_META[certainty];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm" aria-hidden="true">
          {meta.symbol}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{meta.label}</h3>
        <span className="text-xs text-muted-foreground">— {meta.description}</span>
      </div>

      <div className="space-y-1">
        {branches.map((branch) => (
          <BranchNode
            key={branch.id}
            branch={branch}
            selected={branch.auto || selectedIds.has(branch.id)}
            onToggle={() => onToggle(branch.id)}
            disabled={branch.auto}
            onEdit={!branch.auto && onEditBranch ? () => onEditBranch(branch) : undefined}
          />
        ))}
      </div>

      {certainty === 'uncertain' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddEvent?.()}
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
          イベントを追加
        </Button>
      )}
    </div>
  );
}
