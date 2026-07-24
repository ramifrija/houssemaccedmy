-- Migration: Allow users to delete their own account
-- Required by Apple App Store and Google Play Store

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Remove from conversation participants
  DELETE FROM public.conversation_participants WHERE user_id = v_user_id;

  -- Remove messages sent by user
  DELETE FROM public.messages WHERE sender_id = v_user_id;

  -- Remove student enrollments
  DELETE FROM public.student_enrollments WHERE student_id = v_user_id;

  -- Remove teacher_classes
  DELETE FROM public.teacher_classes WHERE teacher_id = v_user_id;

  -- Remove parent_students links
  DELETE FROM public.parent_students WHERE parent_id = v_user_id;

  -- Remove attendance records
  DELETE FROM public.attendance_records WHERE student_id = v_user_id;

  -- Remove grades
  DELETE FROM public.grades WHERE student_id = v_user_id;

  -- Remove notifications
  DELETE FROM public.notifications WHERE user_id = v_user_id;

  -- Remove profile
  DELETE FROM public.profiles WHERE user_id = v_user_id;

  -- Delete auth user (requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
