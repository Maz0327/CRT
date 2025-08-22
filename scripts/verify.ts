// scripts/verify.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../shared/database.types'

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }
})

async function main() {
  for (const table of ['users', 'captures', 'cultural_moments', 'dsd_briefs'] as const) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) throw error
    console.log(table, count)
  }
}

main().catch(console.error)