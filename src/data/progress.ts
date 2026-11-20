/**
 * 한 판의 진행 상태: 인트로의 이름 → 부지 → 견적 선택.
 * 브라우저(localStorage)에 남아 새로고침·재방문 후에도 이어집니다.
 */
import { fetchSave, pushSave } from '../lib/api'
import { catalog, defaultHouseName, defaultSpec, sites, specOrder, type SiteId, type SpecKey, type SpecOption } from './game'

const SPEC_KEY = 'rebuild.spec'
const PROFILE_KEY = 'rebuild.profile'
/** 마지막으로 이 브라우저에서 진행을 바꾼 시각 (서버 저장본과 비교용) */
const UPDATED_KEY = 'rebuild.updatedAt'

export type Spec = Record<SpecKey, string>
export type Profile = { player: string; house: string }

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: the game still works for this visit */
  }
}

/** 진행이 바뀌면 시각을 남기고, 잠시 뒤 서버에도 저장합니다. */
function touch() {
  write(UPDATED_KEY, new Date().toISOString())
  scheduleServerSave()
}

/* ---------- 서버 동기화 ---------- */
let saveTimer: number | undefined

function scheduleServerSave() {
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => void saveProgressNow(), 1500)
}

/** 지금 진행을 서버에 저장합니다. 메뉴의 "저장하기"가 호출합니다. */
export function saveProgressNow(): Promise<boolean> {
  window.clearTimeout(saveTimer)
  const { player, house } = loadProfile()
  return pushSave({ player_name: player, house_name: house, spec: loadSpec() })
}

/**
 * 시작할 때 서버 저장본이 이 브라우저 것보다 새로우면 가져옵니다.
 * (같은 브라우저의 익명 계정이므로 보통은 이미 같지만, 브라우저 저장소만 지워진 경우 복구됩니다.)
 */
export async function restoreProgressFromServer(): Promise<boolean> {
  const save = await fetchSave()
  if (!save) return false
  const localAt = read<string>(UPDATED_KEY)
  if (localAt && localAt >= save.updated_at) return false
  write(PROFILE_KEY, { player: save.player_name, house: save.house_name })
  write(SPEC_KEY, { ...defaultSpec, ...save.spec })
  write(UPDATED_KEY, save.updated_at)
  return true
}

/* ---------- 이름 ---------- */
export function loadProfile(): Profile {
  const p = read<Partial<Profile>>(PROFILE_KEY)
  return { player: p?.player ?? '', house: p?.house ?? '' }
}

export function saveProfile(profile: Profile) {
  write(PROFILE_KEY, profile)
  touch()
}

/** HUD·결과에 쓰는 집 이름. 입력 전이면 디자인 기본값. */
export function loadHouseName(): string {
  return loadProfile().house.trim() || defaultHouseName
}

/* ---------- 부지·견적 선택 ---------- */
export function loadSpec(): Spec {
  const saved = read<Partial<Spec>>(SPEC_KEY) ?? {}
  const spec = { ...defaultSpec }
  for (const k of specOrder) {
    const id = saved[k]
    if (id && catalog[k].options.some((o) => o.id === id)) spec[k] = id
  }
  return spec
}

export function saveSpec(spec: Spec) {
  write(SPEC_KEY, spec)
  touch()
}

export function loadSite(): SiteId {
  return loadSpec().site as SiteId
}

export function saveSite(id: SiteId) {
  if (sites.some((s) => s.id === id)) saveSpec({ ...loadSpec(), site: id })
}

/** 선택을 실제 옵션과 금액으로 풀어 줍니다. 금액은 억 단위. */
export function resolveSpec(spec: Spec) {
  const options = Object.fromEntries(
    specOrder.map((k) => [k, catalog[k].options.find((o) => o.id === spec[k]) ?? catalog[k].options[0]]),
  ) as Record<SpecKey, SpecOption>
  const spent = specOrder.reduce((sum, k) => sum + options[k].cost, 0)
  const remain = Math.round((100 - spent) * 10) / 10
  return { options, spent, remain }
}
