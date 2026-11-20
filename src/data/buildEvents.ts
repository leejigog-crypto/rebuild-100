/**
 * 4단계 시공 중 돌발 상황.
 * 공정(기초·골조·외장·내장·준공)마다 후보를 두고, 한 판에 공정당 2~3개를 무작위로 뽑아 발생시킵니다.
 *
 * 금액 단위: 0.1억 (3 = 0.3억). 음수면 예산이 늘어납니다(환급·할인).
 */

export type StatName = '안전성' | '디자인' | '만족도'

export type EventChoice = {
  label: string
  /** 0.1억 단위 지출 */
  cost?: number
  /** 공사 기간 증가(일) */
  days?: number
  /** 점수 변화 */
  stats?: Partial<Record<StatName, number>>
}

export type BuildEvent = {
  id: string
  title: string
  desc: string
  choices: EventChoice[]
}

export const phaseEvents: BuildEvent[][] = [
  // 0. 기초
  [
    {
      id: 'groundwater',
      title: '지하수 용출!',
      desc: '땅을 파자 바닥에서 지하수가 솟아올라요.',
      choices: [
        { label: '배수 펌프를 설치한다', cost: 4 },
        { label: '그대로 콘크리트를 붓는다', stats: { 안전성: -4 } },
        { label: '물이 빠질 때까지 기다린다', days: 4 },
      ],
    },
    {
      id: 'bedrock',
      title: '암반 발견!',
      desc: '기초 자리 밑에서 집채만 한 바위가 나왔어요.',
      choices: [
        { label: '발파 작업을 한다', cost: 6 },
        { label: '기초 위치를 옮긴다', stats: { 디자인: -3 } },
        { label: '장비로 조금씩 깬다', days: 6 },
      ],
    },
    {
      id: 'remicon',
      title: '레미콘 지연!',
      desc: '레미콘 트럭이 교통 체증에 갇혀 버렸어요.',
      choices: [
        { label: '다른 업체를 긴급 호출한다', cost: 3 },
        { label: '도착할 때까지 기다린다', days: 3 },
      ],
    },
    {
      id: 'relic',
      title: '유물 발견!',
      desc: '땅속에서 오래된 기와 조각이 나왔어요.',
      choices: [
        { label: '전문가에게 빠른 조사를 맡긴다', cost: 2, days: 2 },
        { label: '조사단을 기다린다', days: 7 },
      ],
    },
  ],
  // 1. 골조
  [
    {
      id: 'monsoon',
      title: '장마 시작!',
      desc: '일주일째 비가 내려 골조가 젖고 있어요.',
      choices: [
        { label: '방수포를 설치한다', cost: 3 },
        { label: '그대로 진행한다', stats: { 안전성: -3 } },
        { label: '비가 그칠 때까지 쉰다', days: 5 },
      ],
    },
    {
      id: 'steel-price',
      title: '자재값 폭등!',
      desc: '철근 가격이 갑자기 10% 올랐어요.',
      choices: [
        { label: '추가 비용을 낸다', cost: 21 },
        { label: '저가 자재로 바꾼다', cost: 5, stats: { 안전성: -5 } },
        { label: '공사를 잠시 멈춘다', days: 10 },
      ],
    },
    {
      id: 'crane',
      title: '크레인 고장!',
      desc: '타워크레인이 철골을 든 채 멈춰 섰어요.',
      choices: [
        { label: '긴급 수리를 부른다', cost: 5 },
        { label: '소형 장비로 나눠 올린다', days: 4 },
      ],
    },
    {
      id: 'gale',
      title: '강풍 주의보!',
      desc: '바람이 세져 높은 곳 작업이 위험해요.',
      choices: [
        { label: '안전망을 더 설치한다', cost: 3 },
        { label: '작업을 잠시 멈춘다', days: 2 },
        { label: '그냥 강행한다', stats: { 안전성: -6 } },
      ],
    },
  ],
  // 2. 외장
  [
    {
      id: 'glass',
      title: '유리창 파손!',
      desc: '운반하던 대형 통유리가 깨져 버렸어요.',
      choices: [
        { label: '같은 유리를 다시 주문한다', cost: 8 },
        { label: '작은 창으로 바꾼다', stats: { 디자인: -4 } },
        { label: '다음 배송을 기다린다', days: 5 },
      ],
    },
    {
      id: 'neighbor',
      title: '이웃 민원!',
      desc: '공사 소음 때문에 옆집 주민이 찾아왔어요.',
      choices: [
        { label: '떡을 돌리며 사과한다', cost: 1 },
        { label: '작업 시간을 줄인다', days: 3 },
        { label: '못 들은 척한다', stats: { 만족도: -5 } },
      ],
    },
    {
      id: 'cladding',
      title: '외장재 색상 불량!',
      desc: '도착한 외장재 색이 샘플과 달라요.',
      choices: [
        { label: '할인받고 그대로 쓴다', cost: -3, stats: { 디자인: -3 } },
        { label: '덧칠해서 맞춘다', cost: 4 },
        { label: '반품하고 다시 받는다', days: 5 },
      ],
    },
    {
      id: 'heatwave',
      title: '폭염 경보!',
      desc: '한낮 기온이 38도까지 치솟았어요.',
      choices: [
        { label: '야간 작업으로 돌린다', cost: 4 },
        { label: '쉬는 시간을 늘린다', days: 3 },
        { label: '그대로 진행한다', stats: { 안전성: -3 } },
      ],
    },
  ],
  // 3. 내장
  [
    {
      id: 'leak',
      title: '배관 누수!',
      desc: '벽 속 배관에서 물이 새기 시작했어요.',
      choices: [
        { label: '배관을 통째로 교체한다', cost: 7 },
        { label: '새는 곳만 땜질한다', stats: { 안전성: -4 } },
      ],
    },
    {
      id: 'craftsman',
      title: '장인 등장!',
      desc: '솜씨 좋은 목수가 마감을 맡고 싶대요.',
      choices: [
        { label: '모셔 온다', cost: 6, stats: { 디자인: 5 } },
        { label: '정중히 거절한다' },
      ],
    },
    {
      id: 'short',
      title: '전기 합선!',
      desc: '조명 공사 중 차단기가 내려갔어요.',
      choices: [
        { label: '전문 업체에 점검을 맡긴다', cost: 3 },
        { label: '직접 고쳐 본다', stats: { 안전성: -5 } },
        { label: '원인을 천천히 찾는다', days: 3 },
      ],
    },
    {
      id: 'furniture',
      title: '가구 배송 지연!',
      desc: '주문한 붙박이장이 한 달 늦게 온대요.',
      choices: [
        { label: '기성품으로 바꾼다', cost: 2, stats: { 디자인: -3 } },
        { label: '기다린다', days: 4 },
      ],
    },
  ],
  // 4. 준공
  [
    {
      id: 'inspection',
      title: '준공 검사 지적!',
      desc: '검사관이 계단 난간 높이를 지적했어요.',
      choices: [
        { label: '바로 고친다', cost: 2 },
        { label: '재검사 일정을 잡는다', days: 3 },
      ],
    },
    {
      id: 'defect',
      title: '마감 하자 발견!',
      desc: '벽지 이음새가 여기저기 들떠 있어요.',
      choices: [
        { label: '전면 재시공한다', cost: 4 },
        { label: '눈에 띄는 곳만 보수한다', stats: { 디자인: -2 } },
        { label: '시공팀을 다시 부른다', days: 2 },
      ],
    },
    {
      id: 'dust',
      title: '먼지 폭탄!',
      desc: '공사 먼지가 집 안 가득 쌓였어요.',
      choices: [
        { label: '입주 청소 업체를 부른다', cost: 1 },
        { label: '직접 청소한다', days: 2 },
        { label: '대충 쓸고 넘어간다', stats: { 만족도: -3 } },
      ],
    },
  ],
]

/** "−0.3억 · 안전성 −3" 같은 효과 문구 */
export function describeChoice(c: EventChoice): string {
  const parts: string[] = []
  const cost = c.cost ?? 0
  if (cost > 0) parts.push(`−${formatTenth(cost)}억`)
  if (cost < 0) parts.push(`+${formatTenth(-cost)}억`)
  if (cost === 0) parts.push('비용 0')
  for (const [name, n] of Object.entries(c.stats ?? {})) {
    parts.push(`${name} ${n > 0 ? '+' : '−'}${Math.abs(n)}`)
  }
  if (c.days) parts.push(`기간 +${c.days}일`)
  return parts.join(' · ')
}

/** 0.1억 단위 정수를 "0.3" 형태로 */
export function formatTenth(v: number): string {
  return (v / 10).toFixed(1).replace(/\.0$/, '').replace('-', '−')
}

export type ScheduledEvent = { at: number; phase: number; order: number; ofPhase: number; event: BuildEvent }

/** 공정마다 2~3개를 골라 공정 구간(20%) 안에 고르게 흩어 놓습니다. */
export function scheduleEvents(random: () => number = Math.random): ScheduledEvent[] {
  const out: ScheduledEvent[] = []
  phaseEvents.forEach((pool, phase) => {
    const count = Math.min(pool.length, 2 + (random() < 0.5 ? 1 : 0))
    const picked = [...pool].sort(() => random() - 0.5).slice(0, count)
    const start = phase * 20 + 2
    const slot = 16 / count
    picked.forEach((event, i) => {
      const at = start + slot * i + random() * (slot - 1.5)
      out.push({ at: Math.round(at * 10) / 10, phase, order: i + 1, ofPhase: count, event })
    })
  })
  return out
}
