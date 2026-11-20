/** 플레이 진행 상태 저장 (브라우저에 남아 새로고침·재방문 후에도 유지). */
import { defaultSpec, sites, type SiteId } from './game'

const SITE_KEY = 'rebuild.site'

export function loadSite(): SiteId {
  try {
    const v = window.localStorage.getItem(SITE_KEY)
    if (v && sites.some((s) => s.id === v)) return v as SiteId
  } catch {
    /* storage unavailable */
  }
  return defaultSpec.site as SiteId
}

export function saveSite(id: SiteId) {
  try {
    window.localStorage.setItem(SITE_KEY, id)
  } catch {
    /* storage unavailable */
  }
}
