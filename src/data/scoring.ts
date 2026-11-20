/**
 * 5단계 결과 계산: 견적 선택 + 시공 결과 → 점수·등급·칭호.
 * 기준 점수는 디자인 캔버스의 결과 화면 공식을 따릅니다.
 */
import type { BuildResult } from './buildResult'
import { sites, specOrder, type Grade } from './game'
import type { PhotoKey } from './images'
import { resolveSpec, type Spec } from './progress'

const structScore: Record<string, number> = { s1: 62, s2: 78, s3: 96, s4: 99 }
const planScore: Record<string, number> = { p1: 64, p2: 78, p3: 91, p4: 97 }
const lookScore: Record<string, number> = { l1: 74, l2: 86, l3: 93, l4: 96 }
const extraBonus: Record<string, number> = { e1: 0, e2: 2, e3: 4, e4: 5 }
const lookPhoto: Record<string, PhotoKey> = { l1: 'suburb', l2: 'lake', l3: 'forest', l4: 'city' }

const clamp = (v: number, lo = 0, hi = 99) => Math.max(lo, Math.min(hi, Math.round(v)))

export type ResultSummary = ReturnType<typeof computeResult>

export function computeResult(spec: Spec, build: BuildResult | null) {
  const { options, remain: estimateRemain } = resolveSpec(spec)
  // 시공을 거치지 않았다면 견적의 남은 예산을 그대로 씁니다.
  const remainTenth = build?.remaining ?? Math.round(estimateRemain * 10)
  const remain = remainTenth / 10
  const stats = build?.stats ?? { 안전성: 0, 디자인: 0, 만족도: 0 }

  const scores = [
    { label: '디자인', value: clamp((lookScore[spec.look] ?? 86) + (extraBonus[spec.extra] ?? 0) + stats.디자인) },
    { label: '안전성', value: clamp((structScore[spec.struct] ?? 96) + stats.안전성) },
    { label: '예산 효율', value: remain < 0 ? 40 : clamp(60 + remain * 3, 0, 98) },
    { label: '거주 만족도', value: clamp((planScore[spec.plan] ?? 91) + stats.만족도) },
    { label: '시공 속도', value: clamp(75 + (build?.fast ? 15 : 0) - (build?.extraDays ?? 0) * 1.5, 30) },
  ]
  const total = Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length)
  const grade = total >= 88 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : 'C'
  const safety = scores[1].value
  const title =
    safety >= 96 ? '내진 마스터' : remain >= 10 ? '알뜰 건축왕' : spec.look === 'l3' ? '한옥 장인' : spec.look === 'l4' ? '유럽 귀족' : '새 출발 건축가'

  const hasPool = (spec.extra === 'e3' || spec.extra === 'e4') && (spec.look === 'l1' || spec.look === 'l4')
  const site = sites.find((s) => s.id === spec.site) ?? sites[0]

  return {
    failed: remainTenth < 0,
    remainTenth,
    spentTenth: 1000 - remainTenth,
    siteName: options.site.name,
    lookName: options.look.name,
    sitePhoto: site.photo,
    housePhoto: hasPool ? ('city' as PhotoKey) : (lookPhoto[spec.look] ?? 'lake'),
    photoAlt: `완공된 집: ${options.look.name}${hasPool ? ', 수영장 포함' : ''}, ${options.struct.name}`,
    specs: specOrder.map((k) => ({ label: options[k].name.replace(/^\+ /, ''), grade: options[k].grade as Grade })),
    scores,
    total,
    grade,
    title,
  }
}
