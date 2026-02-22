import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        {/* Y-branch symbol */}
        <svg
          width={64}
          height={64}
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto text-muted-foreground"
          aria-hidden="true"
        >
          <line x1="90" y1="94" x2="42" y2="34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <line x1="90" y1="94" x2="138" y2="34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <line x1="90" y1="94" x2="90" y2="156" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <circle cx="90" cy="94" r="9" fill="var(--brand-gold)" />
          <circle cx="42" cy="34" r="6" fill="currentColor" />
          <circle cx="138" cy="34" r="6" fill="currentColor" />
        </svg>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-muted-foreground">ページが見つかりません</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
