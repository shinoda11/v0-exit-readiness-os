// Supabase Database Types — auto-generated from migration schema
// Update this file when migration SQL changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      fitgate_responses: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          answers: Json;
          judgment: string;
          prep_bucket: string | null;
          invitation_token: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          answers: Json;
          judgment: string;
          prep_bucket?: string | null;
          invitation_token?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          answers?: Json;
          judgment?: string;
          prep_bucket?: string | null;
          invitation_token?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pass_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          started_at: string;
          expires_at: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          started_at: string;
          expires_at: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          started_at?: string;
          expires_at?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      prep_mode_subscribers: {
        Row: {
          id: string;
          email: string;
          judgment: string;
          prep_bucket: string | null;
          fitgate_answers: Json | null;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          judgment: string;
          prep_bucket?: string | null;
          fitgate_answers?: Json | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          judgment?: string;
          prep_bucket?: string | null;
          fitgate_answers?: Json | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          profile_data: Json;
          scenarios_data: Json;
          branch_data: Json;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_data: Json;
          scenarios_data?: Json;
          branch_data?: Json;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_data?: Json;
          scenarios_data?: Json;
          branch_data?: Json;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
