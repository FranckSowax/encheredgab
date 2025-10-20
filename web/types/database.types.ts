/**
 * Types générés pour la base de données Supabase
 * 
 * Pour régénérer ces types depuis votre schéma Supabase:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
 * 
 * Pour l'instant, nous utilisons une définition minimale pour permettre au build de passer.
 * À compléter avec la structure réelle de votre base de données.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          avatar_url: string | null
          address: string | null
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          address?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          address?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      auctions: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          start_date: string
          end_date: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          start_date: string
          end_date: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          start_date?: string
          end_date?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      lots: {
        Row: {
          id: string
          auction_id: string
          title: string
          description: string | null
          starting_price: number
          current_price: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auction_id: string
          title: string
          description?: string | null
          starting_price: number
          current_price?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auction_id?: string
          title?: string
          description?: string | null
          starting_price?: number
          current_price?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          auction_id: string
          lot_id: string | null
          user_id: string
          amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          auction_id: string
          lot_id?: string | null
          user_id: string
          amount: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          auction_id?: string
          lot_id?: string | null
          user_id?: string
          amount?: number
          status?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          channel: string
          subject: string | null
          body: string
          data: Json | null
          status: string
          priority: string
          error_message: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          channel: string
          subject?: string | null
          body: string
          data?: Json | null
          status?: string
          priority?: string
          error_message?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          channel?: string
          subject?: string | null
          body?: string
          data?: Json | null
          status?: string
          priority?: string
          error_message?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          sms_enabled: boolean
          push_enabled: boolean
          whatsapp_enabled: boolean
          preferences: Json
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          sms_enabled?: boolean
          push_enabled?: boolean
          whatsapp_enabled?: boolean
          preferences?: Json
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          sms_enabled?: boolean
          push_enabled?: boolean
          whatsapp_enabled?: boolean
          preferences?: Json
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, any>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, any>
        Returns: any
      }
    }
    Enums: {
      [key: string]: string
    }
  }
}
