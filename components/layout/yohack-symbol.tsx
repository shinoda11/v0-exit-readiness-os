'use client';

/** Y-branch symbol SVG — shared between mobile header, sidebar, and bottom nav */
export function YohackSymbol({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 3 branch lines */}
      <line x1="90" y1="94" x2="42" y2="34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <line x1="90" y1="94" x2="138" y2="34" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <line x1="90" y1="94" x2="90" y2="156" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      {/* Decision node — Gold */}
      <circle cx="90" cy="94" r="9" fill="var(--brand-gold)" />
      {/* Endpoint dots */}
      <circle cx="42" cy="34" r="6" fill="currentColor" />
      <circle cx="138" cy="34" r="6" fill="currentColor" />
    </svg>
  );
}
