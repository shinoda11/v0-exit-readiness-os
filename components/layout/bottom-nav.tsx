'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitBranch, Scale, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { YohackSymbol } from '@/components/layout/yohack-symbol';

const tabs = [
  { href: '/app', label: 'ホーム', icon: null },
  { href: '/app/branch', label: '分岐', icon: GitBranch },
  { href: '/app/worldline', label: '比較', icon: Scale },
  { href: '/app/settings', label: '設定', icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-brand-sand bg-brand-linen/95 backdrop-blur-sm">
      <div className="flex h-16 items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const isHome = href === '/app';
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-brand-gold'
                  : 'text-[#B5AFA6]'
              )}
            >
              {isHome ? <YohackSymbol size={20} /> : Icon && <Icon className="h-5 w-5" />}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
