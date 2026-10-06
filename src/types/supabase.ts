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
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          thumbnail: string
          description: string
          component_key: string
          config: Json
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: string
          thumbnail: string
          description: string
          component_key: string
          config?: Json
          active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          category?: string
          thumbnail?: string
          description?: string
          component_key?: string
          config?: Json
          active?: boolean
        }
        Relationships: []
      }
      weddings: {
        Row: {
          id: string
          user_id: string
          template_id: string
          slug: string
          bride_name: string | null
          groom_name: string | null
          wedding_date: string | null
          wedding_time: string | null
          venue_name: string | null
          venue_address: string | null
          venue_maps_url: string | null
          story: string | null
          theme: Json
          published: boolean
          published_at: string | null
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          slug: string
          bride_name?: string | null
          groom_name?: string | null
          wedding_date?: string | null
          wedding_time?: string | null
          venue_name?: string | null
          venue_address?: string | null
          venue_maps_url?: string | null
          story?: string | null
          theme?: Json
          published?: boolean
          published_at?: string | null
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          slug?: string
          bride_name?: string | null
          groom_name?: string | null
          wedding_date?: string | null
          wedding_time?: string | null
          venue_name?: string | null
          venue_address?: string | null
          venue_maps_url?: string | null
          story?: string | null
          theme?: Json
          published?: boolean
          published_at?: string | null
          views?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          wedding_id: string
          title: string
          date: string | null
          time: string | null
          venue: string | null
          address: string | null
          maps_url: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          title: string
          date?: string | null
          time?: string | null
          venue?: string | null
          address?: string | null
          maps_url?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          title?: string
          date?: string | null
          time?: string | null
          venue?: string | null
          address?: string | null
          maps_url?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          }
        ]
      }
      gallery: {
        Row: {
          id: string
          wedding_id: string
          url: string
          path: string
          is_cover: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          url: string
          path: string
          is_cover?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          url?: string
          path?: string
          is_cover?: boolean
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          }
        ]
      }
      music: {
        Row: {
          id: string
          wedding_id: string
          title: string
          artist: string | null
          url: string
          path: string | null
          type: 'upload' | 'preset'
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          title: string
          artist?: string | null
          url: string
          path?: string | null
          type: 'upload' | 'preset'
          created_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          title?: string
          artist?: string | null
          url?: string
          path?: string | null
          type?: 'upload' | 'preset'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          }
        ]
      }
      rsvps: {
        Row: {
          id: string
          wedding_id: string
          guest_name: string
          phone: string | null
          attending: boolean
          guest_count: number
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          guest_name: string
          phone?: string | null
          attending: boolean
          guest_count?: number
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          guest_name?: string
          phone?: string | null
          attending?: boolean
          guest_count?: number
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics: {
        Row: {
          id: string
          wedding_id: string
          event_type: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          event_type: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          event_type?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_views: {
        Args: { wedding_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
