'use client'

import React from 'react'
import Link from 'next/link'

export default function FitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-canvas">
      {/* Simple header — no sidebar */}
      <header className="border-b bg-white/80 backdrop-blur-sm" style={{ borderColor: '#E8E4DE' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="90" y1="94" x2="42" y2="34" stroke="var(--brand-gold)" strokeWidth="7" strokeLinecap="round" />
            <line x1="90" y1="94" x2="138" y2="34" stroke="var(--brand-gold)" strokeWidth="7" strokeLinecap="round" />
            <line x1="90" y1="94" x2="90" y2="156" stroke="var(--brand-gold)" strokeWidth="7" strokeLinecap="round" />
            <circle cx="90" cy="94" r="9" fill="var(--brand-gold)" />
          </svg>
          <span className="text-lg font-semibold text-brand-night">YOHACK</span>
          <Link href="/" className="text-xs ml-auto text-brand-bronze">
            ← トップに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 text-center text-xs text-brand-bronze">
        <p>&copy; 2025 YOHACK. All rights reserved.</p>
      </footer>
    </div>
  )
}
