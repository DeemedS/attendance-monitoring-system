import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {

  const data = await serverSupabaseUser(event)

  return data?.id
})