/**
 * Exit Readiness OS v2 - Zustand Store
 * WorldLine[] を管理する中央状態管理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Profile, SimulationResult } from '@/lib/types';
import type { WorldLine, KeyPerformanceIndicators } from './worldline';
import type { Margin } from './margin';
import type { ScenarioEvent } from './events';
import { createWorldLine, cloneWorldLine, addEventToWorldLine, removeEventFromWorldLine } from './worldline';
import { createDefaultMargin } from './margin';

/**
 * V2 Store の状態
 */
interface V2State {
  // 世界線
  worldLines: WorldLine[];
  activeWorldLineId: string | null;
  comparisonWorldLineId: string | null;
  
  // 設定
  targetFireAge: number | null;
  goalLens: 'stability' | 'growth' | 'balance';
  
  // UI状態
  isCalculating: boolean;
  showV2UI: boolean;
}

/**
 * V2 Store のアクション
 */
interface V2Actions {
  // 世界線の管理
  createBaselineWorldLine: (profile: Profile) => string;
  createNewWorldLine: (name: string, description: string, baseProfile: Profile) => string;
  cloneWorldLine: (worldLineId: string, newName: string) => string | null;
  deleteWorldLine: (worldLineId: string) => void;
  
  // アクティブ世界線の設定
  setActiveWorldLine: (worldLineId: string) => void;
  setComparisonWorldLine: (worldLineId: string | null) => void;
  
  // イベントの管理
  addEvent: (worldLineId: string, event: ScenarioEvent) => void;
  removeEvent: (worldLineId: string, eventId: string) => void;
  
  // 計算結果の更新
  updateWorldLineResult: (
    worldLineId: string,
    simulation: SimulationResult | null,
    margin: Margin | null,
    kpis: KeyPerformanceIndicators | null
  ) => void;
  setCalculating: (worldLineId: string, isCalculating: boolean) => void;
  setError: (worldLineId: string, error: string | null) => void;
  
  // 設定
  setTargetFireAge: (age: number | null) => void;
  setGoalLens: (lens: 'stability' | 'growth' | 'balance') => void;
  
  // UI
  toggleV2UI: () => void;
  
  // ユーティリティ
  getActiveWorldLine: () => WorldLine | null;
  getComparisonWorldLine: () => WorldLine | null;
  getWorldLineById: (id: string) => WorldLine | null;
}

export type V2Store = V2State & V2Actions;

// localStorage key
const V2_STORAGE_KEY = 'exit-readiness-v2-store';

/**
 * V2 Store を作成
 */
export const useV2Store = create<V2Store>()(
  persist(
    (set, get) => ({
      // 初期状態
      worldLines: [],
      activeWorldLineId: null,
      comparisonWorldLineId: null,
      targetFireAge: null,
      goalLens: 'balance',
      isCalculating: false,
      showV2UI: false,

      // 世界線の管理
      createBaselineWorldLine: (profile: Profile) => {
        const baseline = createWorldLine(
          '現状維持',
          '現在の状況を維持した場合のシミュレーション',
          profile,
          [],
          true
        );
        
        set((state) => ({
          worldLines: [baseline, ...state.worldLines.filter(w => !w.isBaseline)],
          activeWorldLineId: baseline.id,
        }));
        
        return baseline.id;
      },

      createNewWorldLine: (name: string, description: string, baseProfile: Profile) => {
        const worldLine = createWorldLine(name, description, baseProfile, [], false);
        
        set((state) => ({
          worldLines: [...state.worldLines, worldLine],
        }));
        
        return worldLine.id;
      },

      cloneWorldLine: (worldLineId: string, newName: string) => {
        const { worldLines } = get();
        const source = worldLines.find(w => w.id === worldLineId);
        if (!source) return null;
        
        const cloned = cloneWorldLine(source, newName);
        
        set((state) => ({
          worldLines: [...state.worldLines, cloned],
        }));
        
        return cloned.id;
      },

      deleteWorldLine: (worldLineId: string) => {
        set((state) => {
          const newWorldLines = state.worldLines.filter(w => w.id !== worldLineId);
          let newActiveId = state.activeWorldLineId;
          let newComparisonId = state.comparisonWorldLineId;
          
          if (state.activeWorldLineId === worldLineId) {
            newActiveId = newWorldLines[0]?.id ?? null;
          }
          if (state.comparisonWorldLineId === worldLineId) {
            newComparisonId = null;
          }
          
          return {
            worldLines: newWorldLines,
            activeWorldLineId: newActiveId,
            comparisonWorldLineId: newComparisonId,
          };
        });
      },

      // アクティブ世界線の設定
      setActiveWorldLine: (worldLineId: string) => {
        set({ activeWorldLineId: worldLineId });
      },

      setComparisonWorldLine: (worldLineId: string | null) => {
        set({ comparisonWorldLineId: worldLineId });
      },

      // イベントの管理
      addEvent: (worldLineId: string, event: ScenarioEvent) => {
        set((state) => ({
          worldLines: state.worldLines.map(w =>
            w.id === worldLineId ? addEventToWorldLine(w, event) : w
          ),
        }));
      },

      removeEvent: (worldLineId: string, eventId: string) => {
        set((state) => ({
          worldLines: state.worldLines.map(w =>
            w.id === worldLineId ? removeEventFromWorldLine(w, eventId) : w
          ),
        }));
      },

      // 計算結果の更新
      updateWorldLineResult: (worldLineId, simulation, margin, kpis) => {
        set((state) => ({
          worldLines: state.worldLines.map(w =>
            w.id === worldLineId
              ? {
                  ...w,
                  result: {
                    ...w.result,
                    simulation,
                    margin,
                    kpis,
                    isCalculating: false,
                    lastCalculatedAt: new Date(),
                    error: null,
                  },
                }
              : w
          ),
        }));
      },

      setCalculating: (worldLineId: string, isCalculating: boolean) => {
        set((state) => ({
          worldLines: state.worldLines.map(w =>
            w.id === worldLineId
              ? { ...w, result: { ...w.result, isCalculating } }
              : w
          ),
          isCalculating,
        }));
      },

      setError: (worldLineId: string, error: string | null) => {
        set((state) => ({
          worldLines: state.worldLines.map(w =>
            w.id === worldLineId
              ? { ...w, result: { ...w.result, error, isCalculating: false } }
              : w
          ),
        }));
      },

      // 設定
      setTargetFireAge: (age: number | null) => {
        set({ targetFireAge: age });
      },

      setGoalLens: (lens: 'stability' | 'growth' | 'balance') => {
        set({ goalLens: lens });
      },

      // UI
      toggleV2UI: () => {
        set((state) => ({ showV2UI: !state.showV2UI }));
      },

      // ユーティリティ
      getActiveWorldLine: () => {
        const { worldLines, activeWorldLineId } = get();
        return worldLines.find(w => w.id === activeWorldLineId) ?? null;
      },

      getComparisonWorldLine: () => {
        const { worldLines, comparisonWorldLineId } = get();
        if (!comparisonWorldLineId) return null;
        return worldLines.find(w => w.id === comparisonWorldLineId) ?? null;
      },

      getWorldLineById: (id: string) => {
        const { worldLines } = get();
        return worldLines.find(w => w.id === id) ?? null;
      },
    }),
    {
      name: V2_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // 永続化するプロパティを限定（計算状態やUI状態は除外）
      partialize: (state) => ({
        worldLines: state.worldLines.map(w => ({
          ...w,
          // 計算結果の一時的な状態は除外（復元後に再計算）
          result: {
            ...w.result,
            isCalculating: false,
            lastCalculatedAt: null, // Dateはシリアライズ問題があるためnull
          }
        })),
        activeWorldLineId: state.activeWorldLineId,
        comparisonWorldLineId: state.comparisonWorldLineId,
        targetFireAge: state.targetFireAge,
        goalLens: state.goalLens,
        // showV2UI と isCalculating は永続化しない
      }),
    }
  )
);
