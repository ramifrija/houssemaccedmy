import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectId = process.env.SUPABASE_PROJECT_ID ?? 'ksbgydgkufejxrjmrysw'
const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'integrations',
  'supabase',
  'types.ts'
)

const output = execSync(`npx supabase gen types typescript --project-id ${projectId}`, {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
})

writeFileSync(outPath, output, 'utf8')
console.log(`Wrote ${outPath}`)
