/**
 * Smoke tests for session sorting and route helpers (run: node scripts/smoke-test-fixes.mjs)
 */
import assert from 'node:assert/strict'

function compareSessionsChronologically(a, b) {
  const dateCmp = a.sessionDate.getTime() - b.sessionDate.getTime()
  if (dateCmp !== 0) return dateCmp
  return a.startTime.localeCompare(b.startTime)
}

function sortSessionsChronologically(sessions) {
  return [...sessions].sort(compareSessionsChronologically)
}

// Bug A: same day, wrong order before fix (11:00 before 08:00)
const sameDay = [
  { id: '1', sessionDate: new Date('2026-06-24T12:00:00'), startTime: '11:00' },
  { id: '2', sessionDate: new Date('2026-06-24T12:00:00'), startTime: '08:00' },
  { id: '3', sessionDate: new Date('2026-06-25T12:00:00'), startTime: '09:00' },
]
const sorted = sortSessionsChronologically(sameDay)
assert.equal(sorted[0].startTime, '08:00', '08:00 should be first on same day')
assert.equal(sorted[1].startTime, '11:00', '11:00 should be second on same day')
assert.equal(sorted[2].startTime, '09:00', 'next day last')

// Legacy redirect paths that must exist in App (static list)
const LEGACY_REDIRECTS = [
  ['/student/schedule', '/calendar'],
  ['/student/messages', '/messaging'],
  ['/teacher/calendar', '/calendar'],
  ['/teacher/messages', '/messaging'],
]
const NEW_ROUTES = [
  '/student/grades',
  '/teacher/grades',
  '/classes',
  '/students',
  '/students/:studentId',
  '/teachers',
  '/teachers/:teacherId',
]

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appTsx = readFileSync(join(root, 'src', 'App.tsx'), 'utf8')

for (const [from, to] of LEGACY_REDIRECTS) {
  assert.ok(
    appTsx.includes(`path="${from}"`) && appTsx.includes(`to="${to}"`),
    `Missing redirect ${from} -> ${to}`
  )
}

for (const route of NEW_ROUTES) {
  assert.ok(appTsx.includes(`path="${route}"`), `Missing route ${route}`)
}

assert.ok(!appTsx.includes('path="/test"'), 'Test route must be removed for production')

assert.ok(
  appTsx.includes('path="/teacher/students"') && appTsx.includes('to="/students"'),
  'Missing redirect /teacher/students -> /students'
)

console.log('✓ Session sort: date + time OK')
console.log('✓ App.tsx redirects and new routes present')
console.log('All smoke tests passed')
