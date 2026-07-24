export function formatUserDisplayName(input: {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}): string {
  const first = input.first_name?.trim() ?? ''
  const last = input.last_name?.trim() ?? ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (input.email?.trim()) return input.email.trim()
  return 'Compte sans nom'
}
