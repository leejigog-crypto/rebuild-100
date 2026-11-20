import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client. Keys come from `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * The anon/publishable key is meant for browsers; Row Level Security protects the data.
 * When the keys are missing the game still runs, just without server features.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null

export const isServerEnabled = supabase !== null

let sessionPromise: Promise<string | null> | null = null

/** 이미 있는 계정만 확인합니다 (새로 만들지 않음). 둘러보기·조회용. */
export async function getExistingUser(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

/**
 * Returns the current user id, signing in anonymously on first use.
 * There is no login screen: each browser gets its own invisible account.
 */
export function ensureUser(): Promise<string | null> {
  if (!supabase) return Promise.resolve(null)
  if (!sessionPromise) {
    const client = supabase
    sessionPromise = (async () => {
      const { data } = await client.auth.getSession()
      if (data.session) return data.session.user.id
      const { data: signed, error } = await client.auth.signInAnonymously()
      if (error) throw error
      return signed.user?.id ?? null
    })().catch((err) => {
      console.warn('[supabase] anonymous sign-in failed', err)
      sessionPromise = null
      return null
    })
  }
  return sessionPromise
}
