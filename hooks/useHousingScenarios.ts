'use client';

import { useState, useCallback } from 'react';
import { runHousingScenarios, type HousingScenarioResult, type BuyNowParams } from '@/lib/housing-sim';
import type { Profile } from '@/lib/types';

export const useHousingScenarios = (profile: Profile) => {
  const [results, setResults] = useState<HousingScenarioResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComparison = useCallback(async (params: BuyNowParams) => {
    setIsRunning(true);
    setError(null);

    try {
      // Use a Promise to wrap the potentially synchronous but heavy computation
      // to allow the UI to update to the 'isRunning' state.
      await new Promise(resolve => setTimeout(resolve, 0));

      const res = runHousingScenarios(profile, params);
      setResults(res);
    } catch (e) {
      console.error('Housing scenarios failed', e);
      setError('シミュレーションに失敗しました。');
      setResults(null);
    } finally {
      setIsRunning(false);
    }
  }, [profile]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, isRunning, error, runComparison, clearResults };
};
