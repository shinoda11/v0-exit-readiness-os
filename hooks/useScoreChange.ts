'use client';

import { useEffect, useRef, useState } from 'react';

export type ScoreDirection = 'up' | 'down' | null;

/**
 * Tracks score changes and returns the direction ('up' | 'down' | null).
 * Resets to null after `resetMs` milliseconds.
 */
export function useScoreChange(
  currentValue: number | null | undefined,
  resetMs = 600
): ScoreDirection {
  const prevRef = useRef<number | null>(null);
  const [direction, setDirection] = useState<ScoreDirection>(null);

  useEffect(() => {
    if (currentValue == null) {
      prevRef.current = null;
      return;
    }
    if (prevRef.current === null) {
      prevRef.current = currentValue;
      return;
    }
    if (currentValue > prevRef.current) {
      setDirection('up');
    } else if (currentValue < prevRef.current) {
      setDirection('down');
    }
    prevRef.current = currentValue;

    const timer = setTimeout(() => setDirection(null), resetMs);
    return () => clearTimeout(timer);
  }, [currentValue, resetMs]);

  return direction;
}
