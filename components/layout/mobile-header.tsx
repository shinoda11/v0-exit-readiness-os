'use client';

import { useState } from 'react';
import { YohackSymbol } from './yohack-symbol';
import { BrandStoryDialog } from './brand-story-dialog';

export function MobileHeader() {
  const [showBrand, setShowBrand] = useState(false);

  return (
    <>
      <header className="md:hidden flex items-center gap-2 px-4 h-11 border-b border-[#F0ECE4]">
        <button
          onClick={() => setShowBrand(true)}
          className="flex items-center gap-2"
          aria-label="ブランドストーリーを表示"
        >
          <YohackSymbol size={20} />
          <span className="text-sm font-semibold tracking-wider" style={{ color: '#C8B89A' }}>
            YOHACK
          </span>
        </button>
      </header>
      <BrandStoryDialog open={showBrand} onOpenChange={setShowBrand} />
    </>
  );
}
