'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '@/lib/store';
import { runSimulation } from '@/lib/engine';

/**
 * useMainSimulation - 即座のフィードバックループを実現するフック
 * 
 * 初回マウント時にシミュレーションをトリガーする。
 * 以降の更新はstore内のdebounceが自動的に処理する。
 */
export function useMainSimulation() {
  const runSimulationAsync = useProfileStore(state => state.runSimulationAsync);
  const isFirstRun = useRef(true);
  
  // 初回マウント時のみシミュレーションを実行
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      runSimulationAsync();
    }
  }, [runSimulationAsync]);
}

/**
 * useHousingScenario - 住宅シナリオ比較を実行するフック
 */
export function useHousingScenario() {
  const { profile } = useProfileStore();
  
  // 住宅シナリオは housing-sim.ts で別途管理
  // このフックはそれを呼び出すラッパー
}

/**
 * useSimulationWithCallback - シミュレーションを実行し、結果をコールバックで受け取るフック
 * 感度分析や「次の一手」効果計算用
 */
export function useSimulationWithCallback() {
  const { profile } = useProfileStore();
  
  const runWithModification = useCallback(async (
    modifications: Partial<typeof profile>
  ) => {
    const modifiedProfile = { ...profile, ...modifications };
    const result = await runSimulation(modifiedProfile);
    return result;
  }, [profile]);
  
  return { runWithModification };
}

/**
 * useSensitivityAnalysis - 感度分析フック
 * 各パラメータがKPIに与える影響を計算
 */
export function useSensitivityAnalysis() {
  const { profile, simResult } = useProfileStore();
  
  const analyzeSensitivity = useCallback(async (
    parameter: keyof typeof profile,
    delta: number
  ) => {
    if (!simResult) return null;
    
    const currentValue = profile[parameter] as number;
    const modifiedProfile = { 
      ...profile, 
      [parameter]: currentValue + delta 
    };
    
    const modifiedResult = await runSimulation(modifiedProfile);
    
    return {
      parameter,
      delta,
      originalScore: simResult.score.overall,
      modifiedScore: modifiedResult.score.overall,
      scoreDelta: modifiedResult.score.overall - simResult.score.overall,
      originalFireAge: simResult.metrics.fireAge,
      modifiedFireAge: modifiedResult.metrics.fireAge,
      fireAgeDelta: simResult.metrics.fireAge && modifiedResult.metrics.fireAge 
        ? modifiedResult.metrics.fireAge - simResult.metrics.fireAge 
        : null,
    };
  }, [profile, simResult]);
  
  return { analyzeSensitivity };
}
