// Supabase DB Service Layer
// CRUD operations for fitgate_responses, pass_subscriptions, prep_mode_subscribers, user_profiles

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './types';

type Client = SupabaseClient<Database>;

// =============================================================
// FitGate Responses
// =============================================================

export async function insertFitGateResponse(
  client: Client,
  data: {
    email: string;
    answers: Record<string, unknown>;
    judgment: 'ready' | 'prep';
    prepBucket?: 'near' | 'notyet' | null;
    invitationToken?: string | null;
    userId?: string | null;
  }
) {
  const { error } = await client.from('fitgate_responses').insert({
    email: data.email,
    answers: data.answers as unknown as Json,
    judgment: data.judgment,
    prep_bucket: data.prepBucket ?? null,
    invitation_token: data.invitationToken ?? null,
    user_id: data.userId ?? null,
  });

  if (error) {
    console.error('[Supabase] insertFitGateResponse error:', error.message);
    throw error;
  }
}

export async function getFitGateResponsesByUser(client: Client, userId: string) {
  const { data, error } = await client
    .from('fitgate_responses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getFitGateResponsesByUser error:', error.message);
    throw error;
  }

  return data;
}

// =============================================================
// Prep Mode Subscribers
// =============================================================

export async function upsertPrepSubscriber(
  client: Client,
  data: {
    email: string;
    judgment: 'ready' | 'prep';
    prepBucket?: 'near' | 'notyet' | null;
    fitgateAnswers?: Record<string, unknown> | null;
  }
) {
  const { error } = await client.from('prep_mode_subscribers').upsert(
    {
      email: data.email,
      judgment: data.judgment,
      prep_bucket: data.prepBucket ?? null,
      fitgate_answers: (data.fitgateAnswers ?? null) as unknown as Json,
      subscribed_at: new Date().toISOString(),
    },
    { onConflict: 'email' }
  );

  if (error) {
    console.error('[Supabase] upsertPrepSubscriber error:', error.message);
    throw error;
  }
}

// =============================================================
// Pass Subscriptions (Phase 3 — Stripe)
// =============================================================

export async function getActivePass(client: Client, userId: string) {
  const { data, error } = await client
    .from('pass_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] getActivePass error:', error.message);
    throw error;
  }

  return data;
}

export async function hasActivePass(client: Client, userId: string): Promise<boolean> {
  const pass = await getActivePass(client, userId);
  return pass !== null;
}

// =============================================================
// User Profiles (localStorage → DB migration)
// =============================================================

export interface UserProfileRow {
  id: string;
  user_id: string;
  profile_data: Json;
  scenarios_data: Json;
  branch_data: Json;
  updated_at: string;
  created_at: string;
}

export async function getUserProfile(client: Client, userId: string): Promise<UserProfileRow | null> {
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] getUserProfile error:', error.message);
    throw error;
  }

  return data as UserProfileRow | null;
}

export async function upsertUserProfile(
  client: Client,
  userId: string,
  data: {
    profileData: Record<string, unknown>;
    scenariosData?: unknown[];
    branchData?: Record<string, unknown>;
  }
) {
  const { error } = await client.from('user_profiles').upsert(
    {
      user_id: userId,
      profile_data: (data.profileData) as unknown as Json,
      scenarios_data: (data.scenariosData ?? []) as unknown as Json,
      branch_data: (data.branchData ?? {}) as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('[Supabase] upsertUserProfile error:', error.message);
    throw error;
  }
}
