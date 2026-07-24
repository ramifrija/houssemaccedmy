import { useCourseReminders } from '@/hooks/useCourseReminders'

/** Invisible host that schedules 15-minute course reminder toasts. */
export function CourseReminderHost() {
  useCourseReminders()
  return null
}
