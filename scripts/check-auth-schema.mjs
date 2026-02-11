import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const schemaPath = resolve(process.cwd(), '.nuxt/better-auth/schema.sqlite.ts')
const schema = readFileSync(schemaPath, 'utf8')

const requiredExports = ['user', 'account', 'session', 'verification']
const missing = requiredExports.filter((table) => !schema.includes(`export const ${table} =`))

if (missing.length > 0) {
  console.error(`[check-auth-schema] Missing table exports in ${schemaPath}: ${missing.join(', ')}`)
  process.exit(1)
}

console.log(`[check-auth-schema] OK: ${requiredExports.join(', ')}`)
