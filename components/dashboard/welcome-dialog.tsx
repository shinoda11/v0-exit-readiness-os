'use client';

import React from 'react';
import { User, Wallet, PiggyBank } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/** Simple Y-branch symbol (no animation) */
function YSymbol() {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-foreground"
    >
      <line x1="90" y1="94" x2="42" y2="34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <line x1="90" y1="94" x2="138" y2="34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <line x1="90" y1="94" x2="90" y2="156" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <circle cx="90" cy="94" r="9" fill="#C8B89A" />
      <circle cx="42" cy="34" r="6" fill="currentColor" />
      <circle cx="138" cy="34" r="6" fill="currentColor" />
    </svg>
  );
}

const steps = [
  {
    icon: <User className="h-5 w-5" />,
    label: '基本情報',
    description: '年齢・世帯・退職目標',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    label: '収入と支出',
    description: '年収・生活費・住居費',
  },
  {
    icon: <PiggyBank className="h-5 w-5" />,
    label: '資産',
    description: 'あるだけでOK',
  },
];

interface WelcomeDialogProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export function WelcomeDialog({ open, onStart, onSkip }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onSkip(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" showCloseButton={false}>
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <YSymbol />
            <DialogTitle className="text-xl font-bold">
              YOHACK へようこそ
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground tracking-[0.25em]">
              人生に、余白を。
            </DialogDescription>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            3つのステップであなたの人生シミュレーションが始まります。<br />
            まずは基本情報を入力してみましょう。
          </p>

          {/* Steps */}
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 rounded-lg border p-3 sm:p-4 sm:text-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C8B89A]/15 text-[#C8B89A]">
                  {step.icon}
                </div>
                <div className="sm:space-y-1">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground mr-1">{i + 1}.</span>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-2">
            <Button
              className="w-full sm:w-auto px-8"
              style={{ backgroundColor: '#C8B89A', color: '#1A1916' }}
              onClick={onStart}
            >
              はじめる
            </Button>
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={onSkip}
            >
              スキップ
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
