/** 4단계 시공 결과를 5단계 결과 화면에 넘기기 위한 저장소 (탭을 닫으면 사라짐). */

const KEY = 'rebuild.buildResult'

export type BuildResult = {
  /** 준공 시점 남은 예산 (0.1억 단위, 음수면 초과) */
  remaining: number
}

export function saveBuildResult(result: BuildResult) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(result))
  } catch {
    /* storage unavailable: result page falls back to the default view */
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
    const parsed = JSON.parse(raw) as Partial<BuildResult>
    return typeof parsed.remaining === 'number' ? { remaining: parsed.remaining } : null
  } catch {
    return null
  }
}
