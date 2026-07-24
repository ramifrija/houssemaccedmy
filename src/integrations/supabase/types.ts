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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      academic_levels: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_levels_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "academic_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          audience: string
          author_id: string
          content: string
          created_at: string
          id: string
          priority: string
          title: string
        }
        Insert: {
          audience?: string
          author_id: string
          content: string
          created_at?: string
          id?: string
          priority?: string
          title: string
        }
        Update: {
          audience?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          priority?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          arrival_time: string | null
          created_at: string | null
          id: string
          marked_at: string | null
          marked_by: string | null
          notes: string | null
          session_id: string
          status: string
          student_id: string
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          session_id: string
          status?: string
          student_id: string
        }
        Update: {
          arrival_time?: string | null
          created_at?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          session_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          class_id: number
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          session_date: string
          start_time: string
          status: string
          subject: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: number
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          session_date: string
          start_time: string
          status?: string
          subject: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: number
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          session_date?: string
          start_time?: string
          status?: string
          subject?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_level_id: number
          created_at: string
          id: number
          name: string
        }
        Insert: {
          academic_level_id: number
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          academic_level_id?: number
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_academic_level"
            columns: ["academic_level_id"]
            isOneToOne: false
            referencedRelation: "academic_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      course_schedules: {
        Row: {
          course_id: string
          created_at: string | null
          day_of_week: number
          effective_from: string
          effective_until: string | null
          end_time: string
          id: string
          is_active: boolean | null
          room: string | null
          start_time: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          day_of_week: number
          effective_from: string
          effective_until?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          room?: string | null
          start_time: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          day_of_week?: number
          effective_from?: string
          effective_until?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          room?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "calendar_sessions_view"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          course_id: string
          created_at: string | null
          end_time: string
          id: string
          is_exam: boolean | null
          is_makeup: boolean | null
          notes: string | null
          room: string | null
          schedule_id: string | null
          session_date: string
          start_time: string
          status: string
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          end_time: string
          id?: string
          is_exam?: boolean | null
          is_makeup?: boolean | null
          notes?: string | null
          room?: string | null
          schedule_id?: string | null
          session_date: string
          start_time: string
          status?: string
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          is_exam?: boolean | null
          is_makeup?: boolean | null
          notes?: string | null
          room?: string | null
          schedule_id?: string | null
          session_date?: string
          start_time?: string
          status?: string
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "calendar_sessions_view"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_sessions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year: string
          class_id: number
          code: string
          color: string | null
          created_at: string | null
          credits: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          semester: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          class_id: number
          code: string
          color?: string | null
          created_at?: string | null
          credits?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          semester?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          class_id?: number
          code?: string
          color?: string | null
          created_at?: string | null
          credits?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          semester?: string | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      data_exports: {
        Row: {
          created_at: string | null
          download_count: number | null
          error_message: string | null
          expires_at: string | null
          export_type: string
          file_name: string
          file_path: string | null
          file_size: number | null
          filters: Json | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          export_type: string
          file_name: string
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          class_id: number
          created_at: string
          id: number
          name: string
        }
        Insert: {
          class_id: number
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          class_id?: number
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_class"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          edited_at: string | null
          id: string
          is_deleted: boolean
          sender_id: string
          sent_at: string
          message_type: string | null
          metadata: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          sender_id: string
          sent_at?: string
          message_type?: string | null
          metadata?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          sender_id?: string
          sent_at?: string
          message_type?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          announcement_notifications: boolean | null
          attendance_notifications: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          grade_notifications: boolean | null
          id: string
          push_enabled: boolean | null
          reminder_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcement_notifications?: boolean | null
          attendance_notifications?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          grade_notifications?: boolean | null
          id?: string
          push_enabled?: boolean | null
          reminder_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcement_notifications?: boolean | null
          attendance_notifications?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          grade_notifications?: boolean | null
          id?: string
          push_enabled?: boolean | null
          reminder_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          content_template: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          title_template: string
          type: string
        }
        Insert: {
          content_template: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          title_template: string
          type: string
        }
        Update: {
          content_template?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          title_template?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          priority: string | null
          read_at: string | null
          related_id: string | null
          related_table: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          message_id: string
          option_index: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          option_index: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          option_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          parent_id: string | null
          requested_role: string | null
          role_id: number | null
          user_id: string
          user_role_id: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          parent_id?: string | null
          requested_role?: string | null
          role_id?: number | null
          user_id: string
          user_role_id?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          parent_id?: string | null
          requested_role?: string | null
          role_id?: number | null
          user_id?: string
          user_role_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_backup_pre_reconstruct: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          parent_id: string | null
          role_id: number | null
          user_id: string | null
          user_role_id: number | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          parent_id?: string | null
          role_id?: number | null
          user_id?: string | null
          user_role_id?: number | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          parent_id?: string | null
          role_id?: number | null
          user_id?: string | null
          user_role_id?: number | null
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          class_id: number
          enrolled_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          class_id: number
          enrolled_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          class_id?: number
          enrolled_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teacher_classes: {
        Row: {
          class_id: number
          created_at: string | null
          id: string
          teacher_id: string
        }
        Insert: {
          class_id: number
          created_at?: string | null
          id?: string
          teacher_id: string
        }
        Update: {
          class_id?: number
          created_at?: string | null
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          role_name: string
        }
        Insert: {
          id?: number
          role_name: string
        }
        Update: {
          id?: number
          role_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      calendar_sessions_view: {
        Row: {
          class_id: number | null
          class_name: string | null
          course_color: string | null
          course_id: string | null
          course_name: string | null
          end_time: string | null
          notes: string | null
          room: string | null
          schedule_id: string | null
          session_date: string | null
          session_id: string | null
          session_status: string | null
          start_time: string | null
          teacher_first_name: string | null
          teacher_id: string | null
          teacher_last_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_delete_user: { Args: { p_user_id: string }; Returns: boolean }
      create_attendance_session: {
        Args: {
          p_class_id: number
          p_end_time: string
          p_notes?: string
          p_session_date: string
          p_start_time: string
          p_subject: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_content: string
          p_priority?: string
          p_related_id?: string
          p_related_table?: string
          p_scheduled_for?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      ensure_admin_role_for_specific_user: { Args: never; Returns: undefined }
      generate_course_sessions: {
        Args: { p_course_id: string; p_end_date: string; p_start_date: string }
        Returns: number
      }
      get_messageable_contacts: {
        Args: never
        Returns: {
          first_name: string
          last_name: string
          role_name: string
          user_id: string
        }[]
      }
      get_my_conversations: {
        Args: never
        Returns: {
          conversation_id: string
          is_group: boolean
          last_message: string
          last_message_at: string
          other_first_name: string
          other_last_name: string
          other_role: string
          other_user_id: string
          title: string
          updated_at: string
        }[]
      }
      get_user_approval_status: { Args: { user_uuid: string }; Returns: string }
      get_user_role: { Args: { user_uuid: string }; Returns: string }
      get_user_role_id: { Args: never; Returns: number }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_uuid: string }; Returns: boolean }
      is_parent: { Args: never; Returns: boolean }
      is_prof: { Args: never; Returns: boolean }
      is_student: { Args: never; Returns: boolean }
      is_user_approved: { Args: { user_uuid: string }; Returns: boolean }
      mark_attendance: {
        Args: {
          p_arrival_time?: string
          p_notes?: string
          p_session_id: string
          p_status: string
          p_student_id: string
        }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      request_data_export: {
        Args: { p_export_type: string; p_filters?: Json }
        Returns: string
      }
      send_message_to_role: {
        Args: { p_content: string; p_target_role: string; p_title: string }
        Returns: string
      }
      start_individual_conversation: {
        Args: { p_content: string; p_recipient_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "parent" | "student"
      user_status: "pending" | "approved" | "rejected"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "teacher", "parent", "student"],
      user_status: ["pending", "approved", "rejected"],
    },
  },
} as const
