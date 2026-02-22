'use client'

import React from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { MobileHeader } from '@/components/layout/mobile-header'
import { useSupabaseSync } from '@/hooks/use-supabase-sync'

function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  useSupabaseSync();
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseSyncProvider>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Sidebar />
        <main className="min-h-screen pb-20 md:pb-0 md:ml-64">
          <MobileHeader />
          {children}
        </main>
        <BottomNav />
      </div>
    </SupabaseSyncProvider>
  )
}
