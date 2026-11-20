/** 4단계 시공 결과를 5단계 결과 화면에 넘기기 위한 저장소 (탭을 닫으면 사라짐). */
import type { StatName } from './buildEvents'

const KEY = 'rebuild.buildResult'

export type BuildResult = {
  /** 준공 시점 남은 예산 (0.1억 단위, 음수면 초과) */
  remaining: number
  /** 돌발 상황 선택으로 누적된 점수 변화 */
  stats: Record<StatName, number>
  /** 돌발 상황으로 늘어난 공사 기간(일) */
  extraDays: number
  /** 빠른 시공 사용 여부 */
  fast: boolean
}

export const emptyStats: Record<StatName, number> = { 안전성: 0, 디자인: 0, 만족도: 0 }

export function saveBuildResult(result: BuildResult) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(result))
  } catch {
    /* storage unavailable: result page falls back to the estimate */
  }
}

export function clearBuildResult() {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function loadBuildResult(): BuildResult | null {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<BuildResult>
    if (typeof p.remaining !== 'number') return null
    return {
      remaining: p.remaining,
      stats: { ...emptyStats, ...p.stats },
      extraDays: p.extraDays ?? 0,
      fast: p.fast ?? false,
    }
  } catch {
    return null
  }
}
