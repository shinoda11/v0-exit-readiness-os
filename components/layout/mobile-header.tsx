'use client';

import { YohackSymbol } from './yohack-symbol';

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center gap-2 px-4 h-11 border-b border-[#F0ECE4]">
      <YohackSymbol size={20} />
      <span className="text-sm font-semibold tracking-wider" style={{ color: '#C8B89A' }}>
        YOHACK
      </span>
    </header>
  );
}
