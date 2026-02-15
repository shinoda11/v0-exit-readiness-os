'use client';

import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface TermTooltipProps {
  /** 表示テキスト（用語） */
  term: string;
  /** 解説文 */
  description: string;
}

export function TermTooltip({ term, description }: TermTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="border-b border-dotted border-muted-foreground/40 cursor-help">
          {term}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
