'use client';

/**
 * Exit Readiness OS v2 - useWorldLines フック
 * 世界線の管理と計算を行う
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useV2Store } from '@/lib/v2/store';
import { useProfileStore } from '@/lib/store';
import { runSimulation } from '@/lib/engine';
import { 
  extractKpisFromSimulation, 
  calculateMargin,
  adaptV1ProfileToV2WorldLine 
} from '@/lib/v2/adapter';
import { createEvent, type EventType, type ScenarioEvent } from '@/lib/v2/events';
import { compareWorldLines, type WorldLine, type WorldLineComparison } from '@/lib/v2/worldline';
import type { Profile } from '@/lib/types';

interface UseWorldLinesResult {
  // 状態
  worldLines: WorldLine[];
  activeWorldLine: WorldLine | null;
  comparisonWorldLine: WorldLine | null;
  isCalculating: boolean;
  needsSync: boolean; // ダッシュボードへの反映が必要かどうか
  
  // 世界線操作
  createBaseline: () => void;
  createWorldLine: (name: string, description: string) => string;
  cloneWorldLine: (id: string, newName: string) => string | null;
  deleteWorldLine: (id: string) => void;
  setActive: (id: string) => void;
  setComparison: (id: string | null) => void;
  
  // イベント操作
  addEvent: (worldLineId: string, type: EventType, startYear: number, overrides?: Partial<ScenarioEvent>) => void;
  removeEvent: (worldLineId: string, eventId: string) => void;
  
  // 計算
  recalculateWorldLine: (id: string) => Promise<void>;
  recalculateAll: () => Promise<void>;
  
  // 同期
  syncToMainProfile: () => void; // イベントをダッシュボードに反映
  
  // 比較
  comparison: WorldLineComparison | null;
}

/**
 * 世界線を管理するカスタムフック
 */
export function useWorldLines(): UseWorldLinesResult {
  const { profile, updateProfile } = useProfileStore();
  const store = useV2Store();
  const [needsSync, setNeedsSync] = useState(false);
  const lastSyncedEventsRef = useRef<string>('');
  
  const {
    worldLines,
    activeWorldLineId,
    comparisonWorldLineId,
    isCalculating,
    createBaselineWorldLine,
    createNewWorldLine,
    cloneWorldLine: storeCloneWorldLine,
    deleteWorldLine: storeDeleteWorldLine,
    setActiveWorldLine,
    setComparisonWorldLine,
    addEvent: storeAddEvent,
    removeEvent: storeRemoveEvent,
    updateWorldLineResult,
    setCalculating,
    setError,
    getActiveWorldLine,
    getComparisonWorldLine,
  } = store;
  
  // 初期化: ベースライン世界線と比較用世界線の作成
  useEffect(() => {
    if (profile && worldLines.length === 0) {
      // ベースライン作成
      const baselineId = createBaselineWorldLine(profile);
      
      // 比較用の「支出削減プラン」を自動作成
      const alternativeId = createNewWorldLine(
        '支出最適化プラン', 
        '月5万円の支出削減を想定したシミュレーション',
        profile
      );
      
      // 比較先として自動設定
      setComparisonWorldLine(alternativeId);
      
      // 両方の世界線を計算
      setTimeout(async () => {
        await recalculateWorldLineById(baselineId);
        await recalculateWorldLineById(alternativeId);
      }, 100);
    }
  }, [profile, worldLines.length, createBaselineWorldLine, createNewWorldLine, setComparisonWorldLine]);
  
  // IDを指定して世界線を計算（初期化用）
  const recalculateWorldLineById = useCallback(async (id: string) => {
    const { getWorldLineById } = store;
    const worldLine = getWorldLineById(id);
    if (!worldLine) return;
    
    setCalculating(id, true);
    
    try {
      // イベントを適用したプロファイルを作成
      const modifiedProfile = applyEventsToProfile(worldLine.baseProfile, worldLine.events);
      
      // シミュレーション実行
      const simulation = await runSimulation(modifiedProfile);
      
      // 結果を抽出
      const margin = calculateMargin(modifiedProfile, simulation);
      const kpis = extractKpisFromSimulation(simulation, modifiedProfile);
      
      // 結果を更新
      updateWorldLineResult(id, simulation, margin, kpis);
    } catch (error) {
      setError(id, error instanceof Error ? error.message : 'Calculation failed');
    }
  }, [store, setCalculating, updateWorldLineResult, setError]);
  
  // 世界線の計算
  const recalculateWorldLine = useCallback(async (id: string) => {
    const worldLine = worldLines.find(w => w.id === id);
    if (!worldLine) return;
    
    setCalculating(id, true);
    
    try {
      // イベントを適用したプロファイルを作成
      const modifiedProfile = applyEventsToProfile(worldLine.baseProfile, worldLine.events);
      
      // シミュレーション実行
      const simulation = await runSimulation(modifiedProfile);
      
      // 結果を抽出
      const margin = calculateMargin(modifiedProfile, simulation);
      const kpis = extractKpisFromSimulation(simulation, modifiedProfile);
      
      // 結果を更新
      updateWorldLineResult(id, simulation, margin, kpis);
    } catch (error) {
      setError(id, error instanceof Error ? error.message : 'Calculation failed');
    }
  }, [worldLines, setCalculating, updateWorldLineResult, setError]);
  
  // 全世界線の再計算
  const recalculateAll = useCallback(async () => {
    for (const worldLine of worldLines) {
      await recalculateWorldLine(worldLine.id);
    }
  }, [worldLines, recalculateWorldLine]);
  
  // ベースラインの作成
  const createBaseline = useCallback(() => {
    if (profile) {
      const id = createBaselineWorldLine(profile);
      // 自動的に計算を実行
      setTimeout(() => recalculateWorldLine(id), 0);
    }
  }, [profile, createBaselineWorldLine, recalculateWorldLine]);
  
  // 新しい世界線の作成
  const createWorldLine = useCallback((name: string, description: string) => {
    if (!profile) return '';
    const id = createNewWorldLine(name, description, profile);
    setTimeout(() => recalculateWorldLine(id), 0);
    return id;
  }, [profile, createNewWorldLine, recalculateWorldLine]);
  
  // 世界線のクローン
  const cloneWorldLine = useCallback((id: string, newName: string) => {
    const newId = storeCloneWorldLine(id, newName);
    if (newId) {
      setTimeout(() => recalculateWorldLine(newId), 0);
    }
    return newId;
  }, [storeCloneWorldLine, recalculateWorldLine]);
  
  // イベントの追加
  const addEvent = useCallback((
    worldLineId: string, 
    type: EventType, 
    startYear: number,
    overrides?: Partial<ScenarioEvent>
  ) => {
    const event = createEvent(type, startYear, overrides);
    storeAddEvent(worldLineId, event);
    // イベント追加後に再計算
    setTimeout(() => recalculateWorldLine(worldLineId), 0);
    // ベースラインへの追加なら同期が必要
    const worldLine = worldLines.find(w => w.id === worldLineId);
    if (worldLine?.isBaseline) {
      setNeedsSync(true);
    }
  }, [storeAddEvent, recalculateWorldLine, worldLines]);
  
  // イベントの削除
  const removeEvent = useCallback((worldLineId: string, eventId: string) => {
    storeRemoveEvent(worldLineId, eventId);
    // イベント削除後に再計算
    setTimeout(() => recalculateWorldLine(worldLineId), 0);
    // ベースラインからの削除なら同期が必要
    const worldLine = worldLines.find(w => w.id === worldLineId);
    if (worldLine?.isBaseline) {
      setNeedsSync(true);
    }
  }, [storeRemoveEvent, recalculateWorldLine, worldLines]);
  
  // アクティブな世界線
  const activeWorldLine = getActiveWorldLine();
  const comparisonWorldLine = getComparisonWorldLine();
  
  // 比較結果
  const comparison = activeWorldLine && comparisonWorldLine
    ? compareWorldLines(activeWorldLine, comparisonWorldLine)
    : null;
  
  // ベースライン世界線のイベントをダッシュボードProfileに反映
  const syncToMainProfile = useCallback(() => {
    const baseline = worldLines.find(w => w.isBaseline);
    if (!baseline || !profile) {
      return;
    }
    
    // 前回同期時のイベントIDを取得
    const previousEventIds = lastSyncedEventsRef.current 
      ? JSON.parse(lastSyncedEventsRef.current) as string[]
      : [];
    
    // 新しく追加されたイベントのみを処理（差分計算）
    const newEvents = baseline.events.filter(e => !previousEventIds.includes(e.id));
    const removedEventIds = previousEventIds.filter(
      id => !baseline.events.some(e => e.id === id)
    );
    
    // イベントの影響を集計（新規追加分のみ）
    let additionalExpense = 0;
    let cashAdjustment = 0;
    
    for (const event of newEvents) {
      // 年間支出への影響
      if (event.impact.money !== 0) {
        additionalExpense += event.impact.money;
      }
      // 一時的な支出/収入
      if (event.impact.oneTimeExpense) {
        cashAdjustment -= event.impact.oneTimeExpense;
      }
      if (event.impact.oneTimeIncome) {
        cashAdjustment += event.impact.oneTimeIncome;
      }
    }
    
    // 削除されたイベントの影響を逆算（TODO: 削除時の影響を保持する必要あり）
    // 現時点では新規追加のみ対応
    
    // メインプロファイルを更新（既存の値に加算）
    const updates: Partial<typeof profile> = {};
    
    if (additionalExpense !== 0) {
      updates.livingExpenseAnnual = Math.max(0, profile.livingExpenseAnnual + additionalExpense);
    }
    if (cashAdjustment !== 0) {
      updates.assetCash = Math.max(0, profile.assetCash + cashAdjustment);
    }
    
    // 更新があれば適用（updateProfileはtriggerSimulationを自動実行）
    if (Object.keys(updates).length > 0) {
      updateProfile(updates);
    }
    
    // 世界線も再計算
    recalculateAll();
    
    // 同期完了をマーク
    setNeedsSync(false);
    lastSyncedEventsRef.current = JSON.stringify(baseline.events.map(e => e.id));
  }, [worldLines, profile, updateProfile, recalculateAll]);
  
  return {
    worldLines,
    activeWorldLine,
    comparisonWorldLine,
    isCalculating,
    needsSync,
    createBaseline,
    createWorldLine,
    cloneWorldLine,
    deleteWorldLine: storeDeleteWorldLine,
    setActive: setActiveWorldLine,
    setComparison: setComparisonWorldLine,
    addEvent,
    removeEvent,
    recalculateWorldLine,
    recalculateAll,
    syncToMainProfile,
    comparison,
  };
}

/**
 * イベントをプロファイルに適用
 */
function applyEventsToProfile(profile: Profile, events: ScenarioEvent[]): Profile {
  let modifiedProfile = { ...profile };
  
  // 各イベントの影響を適用
  for (const event of events) {
    // 支出への影響（年間）
    if (event.impact.money !== 0) {
      modifiedProfile.livingExpenseAnnual += event.impact.money;
    }
    
    // 一時的な支出
    if (event.impact.oneTimeExpense) {
      modifiedProfile.assetCash -= event.impact.oneTimeExpense;
    }
    
    // 一時的な収入
    if (event.impact.oneTimeIncome) {
      modifiedProfile.assetCash += event.impact.oneTimeIncome;
    }
  }
  
  return modifiedProfile;
}
