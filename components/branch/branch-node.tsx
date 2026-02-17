'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { Branch } from '@/lib/branch';
import { cn } from '@/lib/utils';

const CERTAINTY_BORDER: Record<string, string> = {
  confirmed: 'border-l-[#1A1916]',
  planned: 'border-l-[#4A7C59]',
  uncertain: 'border-l-[#8A7A62]',
};

interface BranchNodeProps {
  branch: Branch;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function BranchNode({ branch, selected, onToggle, disabled }: BranchNodeProps) {
  const borderColor = CERTAINTY_BORDER[branch.certainty] ?? 'border-l-border';

  return (
    <label
      className={cn(
        'flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-md border-l-4 cursor-pointer transition-colors',
        borderColor,
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/50',
        selected && !disabled && 'bg-accent/30'
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => !disabled && onToggle()}
        disabled={disabled}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground">{branch.label}</span>
        <p className="text-xs text-muted-foreground truncate">{branch.detail}</p>
      </div>
    </label>
  );
}
