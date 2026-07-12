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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string
          done: boolean
          event_date: string
          id: string
          kind: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          event_date: string
          id?: string
          kind?: string
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          event_date?: string
          id?: string
          kind?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          parts: Json
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parts?: Json
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parts?: Json
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          note: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string | null
          role: string
          salary: number
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          salary?: number
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          salary?: number
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fiados: {
        Row: {
          amount: number
          created_at: string
          customer_name: string
          customer_phone: string | null
          due_date: string | null
          id: string
          kind: string
          note: string | null
          paid: boolean
          paid_at: string | null
          sale_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          kind?: string
          note?: string | null
          paid?: boolean
          paid_at?: string | null
          sale_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          kind?: string
          note?: string | null
          paid?: boolean
          paid_at?: string | null
          sale_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiados_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string
          cost: number
          created_at: string
          expires_at: string | null
          id: string
          image_url: string | null
          low_stock_threshold: number
          name: string
          price: number
          sku: string | null
          stock: number
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          category?: string
          cost?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          low_stock_threshold?: number
          name: string
          price?: number
          sku?: string | null
          stock?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          category?: string
          cost?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          low_stock_threshold?: number
          name?: string
          price?: number
          sku?: string | null
          stock?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          actividad_economica: string | null
          address: string | null
          avatar_url: string | null
          business_name: string
          business_type: string | null
          close_time: string | null
          created_at: string
          currency: string
          daily_goal: number
          direccion_fiscal: string | null
          id: string
          locale: string
          low_stock_threshold: number
          notifications_enabled: boolean
          onboarding_done: boolean
          open_time: string | null
          owner_name: string
          phone: string | null
          razon_social: string | null
          regimen: string | null
          ruc: string | null
          updated_at: string
        }
        Insert: {
          actividad_economica?: string | null
          address?: string | null
          avatar_url?: string | null
          business_name?: string
          business_type?: string | null
          close_time?: string | null
          created_at?: string
          currency?: string
          daily_goal?: number
          direccion_fiscal?: string | null
          id: string
          locale?: string
          low_stock_threshold?: number
          notifications_enabled?: boolean
          onboarding_done?: boolean
          open_time?: string | null
          owner_name?: string
          phone?: string | null
          razon_social?: string | null
          regimen?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Update: {
          actividad_economica?: string | null
          address?: string | null
          avatar_url?: string | null
          business_name?: string
          business_type?: string | null
          close_time?: string | null
          created_at?: string
          currency?: string
          daily_goal?: number
          direccion_fiscal?: string | null
          id?: string
          locale?: string
          low_stock_threshold?: number
          notifications_enabled?: boolean
          onboarding_done?: boolean
          open_time?: string | null
          owner_name?: string
          phone?: string | null
          razon_social?: string | null
          regimen?: string | null
          ruc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string | null
          purchase_id: string
          qty: number
          unit_cost: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_id?: string | null
          purchase_id: string
          qty: number
          unit_cost?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string | null
          purchase_id?: string
          qty?: number
          unit_cost?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          note: string | null
          supplier_name: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          supplier_name?: string | null
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          supplier_name?: string | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string | null
          qty: number
          sale_id: string
          unit_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_id?: string | null
          qty?: number
          sale_id: string
          unit_price?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string | null
          qty?: number
          sale_id?: string
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          is_credit: boolean
          note: string | null
          paid: boolean
          payment_method: string
          receipt_number: string | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_credit?: boolean
          note?: string | null
          paid?: boolean
          payment_method?: string
          receipt_number?: string | null
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_credit?: boolean
          note?: string | null
          paid?: boolean
          payment_method?: string
          receipt_number?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_provider: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_counters: {
        Row: {
          count: number
          created_at: string
          id: string
          kind: string
          period_month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          kind: string
          period_month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          kind?: string
          period_month?: string
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
      increment_usage_counter: { Args: { _kind: string }; Returns: number }
    }
    Enums: {
      subscription_plan: "trial" | "pro" | "avanzado"
      subscription_status: "active" | "past_due" | "canceled" | "trialing"
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
      subscription_plan: ["trial", "pro", "avanzado"],
      subscription_status: ["active", "past_due", "canceled", "trialing"],
    },
  },
} as const
