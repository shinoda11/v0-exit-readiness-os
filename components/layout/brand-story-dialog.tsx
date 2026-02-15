'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const APP_VERSION = '0.1.0';

/** Animated Y-branch symbol for the brand story modal */
function AnimatedYSymbol() {
  return (
    <>
      <style>{`
        @keyframes ghost-pulse {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.15; }
        }
        @keyframes node-pulse {
          0%, 100% { r: 5; }
          50% { r: 7; }
        }
        .ghost-line {
          animation: ghost-pulse 4s ease-in-out infinite;
        }
        .decision-node {
          animation: node-pulse 3s ease-in-out infinite;
        }
      `}</style>
      <svg
        width={120}
        height={120}
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="text-foreground"
      >
        {/* Ghost lines — unchosen paths */}
        <line x1="90" y1="94" x2="20" y2="160" stroke="currentColor" className="ghost-line" strokeWidth="3" strokeLinecap="round" />
        <line x1="90" y1="94" x2="160" y2="160" stroke="currentColor" className="ghost-line" strokeWidth="3" strokeLinecap="round" />
        {/* Main 3 branch lines */}
        <line x1="90" y1="94" x2="42" y2="34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <line x1="90" y1="94" x2="138" y2="34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <line x1="90" y1="94" x2="90" y2="156" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        {/* Decision node — Gold, pulsing */}
        <circle cx="90" cy="94" r="6" fill="#C8B89A" className="decision-node" />
        {/* Endpoint dots */}
        <circle cx="42" cy="34" r="5" fill="currentColor" />
        <circle cx="138" cy="34" r="5" fill="currentColor" />
      </svg>
    </>
  );
}

interface BrandStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandStoryDialog({ open, onOpenChange }: BrandStoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden" showCloseButton={false}>
        <div className="p-8 space-y-6">
          {/* Visual header */}
          <div className="flex flex-col items-center gap-3">
            <AnimatedYSymbol />
            <div className="text-center">
              <p className="text-xl font-bold tracking-tight">
                <span className="text-foreground">YO</span>
                <span style={{ color: '#C8B89A' }}>HACK</span>
              </p>
              <p className="text-sm font-light tracking-[0.25em] text-muted-foreground mt-1">人生に、余白を。</p>
            </div>
          </div>

          {/* Hidden accessible title for screen readers */}
          <DialogTitle className="sr-only">YOHACKブランドストーリー</DialogTitle>
          <DialogDescription className="sr-only">YOHACKの思想とデザインコンセプトについて</DialogDescription>

          {/* Philosophy text */}
          <div className="space-y-4 text-base font-light tracking-wide text-muted-foreground leading-loose">
            <p className="text-lg font-normal mb-6">
              人生は分岐の連続です。
            </p>
            <div className="pl-4 border-l-2 border-[#C8B89A]/30 space-y-0.5 font-normal text-[#C8B89A]">
              <p>転職するか、今の会社に残るか。</p>
              <p>家を買うか、賃貸を続けるか。</p>
              <p>子どもを持つか、持たないか。</p>
            </div>
            <p>
              どの選択が「正解」かは、誰にもわかりません。
            </p>
            <p>
              でも、それぞれの未来に何が待っているかを<br />
              数字で見ることはできます。
            </p>
            <p>
              YOHACKは、あなたの人生の「余白」&mdash;<br />
              お金・時間・体力の3つの資源を可視化し、<br />
              異なる世界線を比較するシミュレーターです。
            </p>
            <p>
              Y字の分岐は、あなたの選択。<br />
              ゴールドのノードは、決断の瞬間。<br />
              薄く伸びるラインは、選ばなかった世界線。
            </p>
            <p>
              すべての未来を見渡した上で、<br />
              自分だけの道を選ぶ。
            </p>
            <p className="font-medium text-[#C8B89A]">
              それが、YOHACKの思想です。
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-xs text-muted-foreground">v{APP_VERSION}</span>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
