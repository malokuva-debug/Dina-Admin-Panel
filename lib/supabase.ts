// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          price: number;
          duration: number;
          category_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          duration: number;
          category_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          duration?: number;
          category_id?: string;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          worker: 'dina' | 'kida';
          service: string;
          date: string;
          time: string;
          price: number;
          customer_name: string | null;
          customer_phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker: 'dina' | 'kida';
          service: string;
          date: string;
          time: string;
          price: number;
          customer_name?: string | null;
          customer_phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker?: 'dina' | 'kida';
          service?: string;
          date?: string;
          time?: string;
          price?: number;
          customer_name?: string | null;
          customer_phone?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          name: string;
          amount: number;
          quantity: number;
          date: string;
          worker: 'dina' | 'kida';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          amount: number;
          quantity: number;
          date: string;
          worker: 'dina' | 'kida';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          amount?: number;
          quantity?: number;
          date?: string;
          worker?: 'dina' | 'kida';
          created_at?: string;
        };
      };
      business_hours: {
        Row: {
          id: string;
          worker: 'dina' | 'kida';
          open: string;
          close: string;
          lunch_start: string;
          lunch_end: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker: 'dina' | 'kida';
          open: string;
          close: string;
          lunch_start: string;
          lunch_end: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker?: 'dina' | 'kida';
          open?: string;
          close?: string;
          lunch_start?: string;
          lunch_end?: string;
          updated_at?: string;
        };
      };
      unavailable_dates: {
        Row: {
          id: string;
          worker: 'dina' | 'kida';
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker: 'dina' | 'kida';
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker?: 'dina' | 'kida';
          date?: string;
          created_at?: string;
        };
      };
      unavailable_times: {
        Row: {
          id: string;
          worker: 'dina' | 'kida';
          date: string;
          start: string;
          end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker: 'dina' | 'kida';
          date: string;
          start: string;
          end: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker?: 'dina' | 'kida';
          date?: string;
          start?: string;
          end?: string;
          created_at?: string;
        };
      };
      weekly_days_off: {
        Row: {
          id: string;
          worker: 'dina' | 'kida';
          day: string;
          is_off: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker: 'dina' | 'kida';
          day: string;
          is_off: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker?: 'dina' | 'kida';
          day?: string;
          is_off?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};