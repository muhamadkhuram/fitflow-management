export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      equipment: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          gym_id: string
          id: string
          last_maintenance_date: string | null
          maintenance_notes: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          purchase_date: string | null
          quantity: number
          serial_number: string | null
          status: Database["public"]["Enums"]["equipment_status"]
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          gym_id: string
          id?: string
          last_maintenance_date?: string | null
          maintenance_notes?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          gym_id?: string
          id?: string
          last_maintenance_date?: string | null
          maintenance_notes?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "equipment_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_categories: {
        Row: {
          created_at: string
          description: string | null
          gym_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gym_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gym_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_categories_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_wishlist: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          gym_id: string
          id: string
          name: string
          priority: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          gym_id: string
          id?: string
          name: string
          priority?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          gym_id?: string
          id?: string
          name?: string
          priority?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_wishlist_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "equipment_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_wishlist_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_members: {
        Row: {
          avatar_url: string | null
          email: string
          full_name: string
          gym_id: string
          id: string
          is_active: boolean
          joined_at: string
          phone: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          email: string
          full_name: string
          gym_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string
          full_name?: string
          gym_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_members_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          email: string | null
          fee_amount: number
          fee_type: Database["public"]["Enums"]["fee_type"]
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          fee_amount?: number
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          fee_amount?: number
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      join_requests: {
        Row: {
          created_at: string
          email: string
          full_name: string
          gym_id: string
          id: string
          message: string | null
          phone: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          gym_id: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          gym_id?: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          description: string | null
          gym_id: string
          id: string
          member_id: string
          payment_date: string
          payment_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          description?: string | null
          gym_id: string
          id?: string
          member_id: string
          payment_date?: string
          payment_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          description?: string | null
          gym_id?: string
          id?: string
          member_id?: string
          payment_date?: string
          payment_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gym_members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      equipment_status:
        | "working"
        | "maintenance"
        | "needs_maintenance"
        | "out_of_order"
      fee_type: "weekly" | "monthly"
      request_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      equipment_status: [
        "working",
        "maintenance",
        "needs_maintenance",
        "out_of_order",
      ],
      fee_type: ["weekly", "monthly"],
      request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
