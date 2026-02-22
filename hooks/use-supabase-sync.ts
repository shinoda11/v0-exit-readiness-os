'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProfileStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, upsertUserProfile } from '@/lib/supabase/db';

/**
 * Supabase ↔ localStorage 双方向同期フック
 *
 * - ログイン時: Supabase からプロファイルを取得し、localStorage にマージ
 * - 状態変更時: Supabase に debounce（2秒）で自動保存
 * - 未ログイン時: localStorage のみ（従来通り）
 */
export function useSupabaseSync() {
  const { user } = useAuth();
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Load profile from Supabase on login
  useEffect(() => {
    if (!user || initialLoadDone.current) return;

    const loadFromSupabase = async () => {
      try {
        const supabase = createClient();
        const dbProfile = await getUserProfile(supabase, user.id);

        if (dbProfile) {
          const state = useProfileStore.getState();
          const dbProfileData = dbProfile.profile_data as Record<string, unknown>;
          const dbScenariosData = dbProfile.scenarios_data as unknown[];
          const dbBranchData = dbProfile.branch_data as Record<string, unknown>;

          // Merge: DB takes precedence if updated_at is newer
          // For first-time migration, localStorage data is preserved if DB is empty
          const hasDbData = Object.keys(dbProfileData).length > 0;

          if (hasDbData) {
            useProfileStore.setState({
              profile: { ...state.profile, ...dbProfileData } as typeof state.profile,
              scenarios: Array.isArray(dbScenariosData) ? dbScenariosData as typeof state.scenarios : state.scenarios,
              selectedBranchIds: Array.isArray(dbBranchData.selectedBranchIds) ? dbBranchData.selectedBranchIds as string[] : state.selectedBranchIds,
              customBranches: Array.isArray(dbBranchData.customBranches) ? dbBranchData.customBranches as typeof state.customBranches : state.customBranches,
              hiddenDefaultBranchIds: Array.isArray(dbBranchData.hiddenDefaultBranchIds) ? dbBranchData.hiddenDefaultBranchIds as string[] : state.hiddenDefaultBranchIds,
            });
            // Re-run simulation with loaded profile
            useProfileStore.getState().runSimulationAsync();
          } else {
            // First login: migrate localStorage data to Supabase
            await syncToSupabase(user.id);
          }
        } else {
          // No DB record: migrate localStorage data to Supabase
          await syncToSupabase(user.id);
        }

        initialLoadDone.current = true;
      } catch (error) {
        console.error('[SupabaseSync] Failed to load profile:', error);
        initialLoadDone.current = true;
      }
    };

    loadFromSupabase();
  }, [user]);

  // Subscribe to store changes and sync to Supabase
  useEffect(() => {
    if (!user) return;

    const unsubscribe = useProfileStore.subscribe(() => {
      if (!initialLoadDone.current) return;

      // Debounce: 2 seconds
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        syncToSupabase(user.id);
      }, 2000);
    });

    return () => {
      unsubscribe();
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [user]);

  // Reset on logout
  useEffect(() => {
    if (!user) {
      initialLoadDone.current = false;
    }
  }, [user]);
}

async function syncToSupabase(userId: string) {
  try {
    const state = useProfileStore.getState();
    const supabase = createClient();

    await upsertUserProfile(supabase, userId, {
      profileData: state.profile as unknown as Record<string, unknown>,
      scenariosData: state.scenarios as unknown[],
      branchData: {
        selectedBranchIds: state.selectedBranchIds,
        customBranches: state.customBranches,
        hiddenDefaultBranchIds: state.hiddenDefaultBranchIds,
      },
    });
  } catch (error) {
    console.error('[SupabaseSync] Failed to sync profile:', error);
  }
}
