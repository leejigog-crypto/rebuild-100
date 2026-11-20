/** 서버 데이터 접근. 서버가 꺼져 있거나 실패하면 예외 대신 빈 값/false를 돌려 게임이 멈추지 않게 합니다. */
import { ensureUser, getExistingUser, supabase } from './supabase'

export type HouseRow = {
  id: string
  user_id: string
  player_name: string
  house_name: string
  spec: Record<string, string>
  site_name: string
  look_name: string
  grade: 'S' | 'A' | 'B' | 'C'
  total: number
  title: string
  scores: { label: string; value: number }[]
  remaining_tenth: number
  photo: string
  is_public: boolean
  likes_count: number
  created_at: string
}

export type NewHouse = Omit<HouseRow, 'user_id' | 'is_public' | 'likes_count' | 'created_at'>

export type SaveRow = { player_name: string; house_name: string; spec: Record<string, string>; updated_at: string }

function warn(where: string, error: unknown) {
  console.warn(`[api] ${where}`, error)
}

/* ---------- 진행 저장 ---------- */

export async function fetchSave(): Promise<SaveRow | null> {
  if (!supabase || !(await getExistingUser())) return null
  const { data, error } = await supabase.from('saves').select('player_name, house_name, spec, updated_at').maybeSingle()
  if (error) warn('fetchSave', error)
  return (data as SaveRow | null) ?? null
}

export async function pushSave(save: Omit<SaveRow, 'updated_at'>): Promise<boolean> {
  if (!supabase) return false
  const userId = await ensureUser()
  if (!userId) return false
  const { error } = await supabase
    .from('saves')
    .upsert({ user_id: userId, ...save, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) warn('pushSave', error)
  return !error
}

/* ---------- 완공한 집 ---------- */

/** 같은 시공 회차(id)는 한 번만 저장됩니다. */
export async function saveHouse(house: NewHouse): Promise<boolean> {
  if (!supabase || !(await ensureUser())) return false
  const { error } = await supabase.from('houses').upsert(house, { onConflict: 'id', ignoreDuplicates: true })
  if (error) warn('saveHouse', error)
  return !error
}

export async function setHousePublic(id: string, isPublic: boolean): Promise<boolean> {
  if (!supabase || !(await ensureUser())) return false
  const { error } = await supabase.from('houses').update({ is_public: isPublic }).eq('id', id)
  if (error) warn('setHousePublic', error)
  return !error
}

export async function deleteHouse(id: string): Promise<boolean> {
  if (!supabase || !(await ensureUser())) return false
  const { error } = await supabase.from('houses').delete().eq('id', id)
  if (error) warn('deleteHouse', error)
  return !error
}

export async function getHouse(id: string): Promise<HouseRow | null> {
  if (!supabase) return null
  await getExistingUser()
  const { data, error } = await supabase.from('houses').select('*').eq('id', id).maybeSingle()
  if (error) warn('getHouse', error)
  return (data as HouseRow | null) ?? null
}

export async function listPublicHouses(order: 'likes' | 'total', limit = 24): Promise<HouseRow[]> {
  if (!supabase) return []
  let q = supabase.from('houses').select('*').eq('is_public', true)
  q = order === 'likes' ? q.order('likes_count', { ascending: false }) : q.order('total', { ascending: false })
  const { data, error } = await q.order('created_at', { ascending: false }).limit(limit)
  if (error) warn('listPublicHouses', error)
  return (data as HouseRow[] | null) ?? []
}

export async function listMyHouses(): Promise<HouseRow[]> {
  if (!supabase) return []
  const userId = await getExistingUser()
  if (!userId) return []
  const { data, error } = await supabase.from('houses').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) warn('listMyHouses', error)
  return (data as HouseRow[] | null) ?? []
}

/* ---------- 좋아요 ---------- */

export async function fetchMyLikes(houseIds: string[]): Promise<Set<string>> {
  // 좋아요한 적이 없으면 계정도 없으니 새로 만들지 않습니다.
  if (!supabase || houseIds.length === 0 || !(await getExistingUser())) return new Set()
  const { data, error } = await supabase.from('likes').select('house_id').in('house_id', houseIds)
  if (error) warn('fetchMyLikes', error)
  return new Set((data ?? []).map((r: { house_id: string }) => r.house_id))
}

export async function setLike(houseId: string, liked: boolean): Promise<boolean> {
  if (!supabase || !(await ensureUser())) return false
  const { error } = liked
    ? await supabase.from('likes').insert({ house_id: houseId })
    : await supabase.from('likes').delete().eq('house_id', houseId)
  if (error) warn('setLike', error)
  return !error
}
