/**
 * 한 판의 진행 상태: 인트로의 이름 → 부지 → 견적 선택.
 * 브라우저(localStorage)에 남아 새로고침·재방문 후에도 이어집니다.
 */
import { catalog, defaultHouseName, defaultSpec, sites, specOrder, type SiteId, type SpecKey, type SpecOption } from './game'

const SPEC_KEY = 'rebuild.spec'
const PROFILE_KEY = 'rebuild.profile'

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

/* ---------- 이름 ---------- */
export function loadProfile(): Profile {
  const p = read<Partial<Profile>>(PROFILE_KEY)
  return { player: p?.player ?? '', house: p?.house ?? '' }
}

export function saveProfile(profile: Profile) {
  write(PROFILE_KEY, profile)
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
