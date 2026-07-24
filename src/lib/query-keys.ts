export const queryKeys = {
  calendarSessions: ['calendar-sessions'] as const,
  adminStudents: ['admin-users-students'] as const,
  adminTeachers: ['admin-users-teachers'] as const,
  adminPending: ['admin-pending-users'] as const,
  conversations: ['conversations'] as const,
  messageableContacts: ['messageable-contacts'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
}
