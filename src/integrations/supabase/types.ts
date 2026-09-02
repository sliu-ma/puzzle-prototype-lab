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
      app_config: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      round_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          round_id: string
          team_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          round_id: string
          team_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          round_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "round_messages_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          budget_min: number
          code: string
          created_at: string
          id: string
          started_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_min?: number
          code: string
          created_at?: string
          id?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          budget_min?: number
          code?: string
          created_at?: string
          id?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      score_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payload: Json
          team_id: string
          type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payload?: Json
          team_id: string
          type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payload?: Json
          team_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          members: Json
          name: string
          round_id: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          members?: Json
          name: string
          round_id: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          members?: Json
          name?: string
          round_id?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assert_teacher: { Args: { p_password_hash: string }; Returns: undefined }
      round_finish: {
        Args: { p_team_id: string; p_token_hash: string }
        Returns: boolean
      }
      round_join: {
        Args: {
          p_code: string
          p_members: Json
          p_team_name: string
          p_token_hash: string
        }
        Returns: {
          budget_min: number
          round_code: string
          round_status: string
          round_title: string
          started_at: string
          team_id: string
        }[]
      }
      round_leaderboard_data: { Args: { p_code: string }; Returns: Json }
      round_lookup: {
        Args: { p_code: string }
        Returns: {
          budget_min: number
          code: string
          started_at: string
          status: string
          title: string
        }[]
      }
      round_push_events: {
        Args: { p_events: Json; p_team_id: string; p_token_hash: string }
        Returns: number
      }
      round_state: {
        Args: { p_code: string; p_team_id: string; p_token_hash: string }
        Returns: Json
      }
      teacher_create_round: {
        Args: {
          p_budget_min: number
          p_code: string
          p_password_hash: string
          p_title: string
        }
        Returns: {
          code: string
          status: string
          title: string
        }[]
      }
      teacher_delete_round: {
        Args: { p_code: string; p_password_hash: string }
        Returns: boolean
      }
      teacher_delete_team: {
        Args: { p_password_hash: string; p_team_id: string }
        Returns: boolean
      }
      teacher_list_messages: {
        Args: { p_code: string; p_password_hash: string }
        Returns: {
          body: string
          created_at: string
          id: string
          team_id: string
          team_name: string
        }[]
      }
      teacher_list_rounds: {
        Args: { p_password_hash: string }
        Returns: {
          budget_min: number
          code: string
          created_at: string
          started_at: string
          status: string
          team_count: number
          title: string
        }[]
      }
      teacher_round_report: {
        Args: { p_code: string; p_password_hash: string }
        Returns: Json
      }
      teacher_send_message: {
        Args: {
          p_body: string
          p_code: string
          p_password_hash: string
          p_team_id: string
        }
        Returns: string
      }
      teacher_set_round_status: {
        Args: { p_code: string; p_password_hash: string; p_status: string }
        Returns: boolean
      }
      teacher_start_round: {
        Args: { p_code: string; p_password_hash: string }
        Returns: string
      }
      teacher_update_round: {
        Args: {
          p_budget_min: number
          p_code: string
          p_password_hash: string
          p_title: string
        }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
