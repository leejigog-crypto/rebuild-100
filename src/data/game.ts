/**
 * Static content shown by the UI screens.
 * Values mirror the design's default state (호숫가의 봄 · 호숫가 부지 · s3/p3/l2/e2).
 * Game logic (budget math, timers, events, scoring) is intentionally not implemented yet.
 */
import type { PhotoKey } from './images'

export type Grade = '실속' | '표준' | '고급' | '프리미엄'

export const gradeColors: Record<Grade, { bg: string; fg: string }> = {
  실속: { bg: '#9BD35A', fg: '#2B2A27' },
  표준: { bg: '#00A7E2', fg: '#2B2A27' },
  고급: { bg: '#F28A19', fg: '#2B2A27' },
  프리미엄: { bg: '#1032CF', fg: '#FFFFFF' },
}

export const stageNames = ['부지', '설계', '꾸미기', '시공', '완공'] as const

export const defaultHouseName = '호숫가의 봄'

/* ---------- 메인 ---------- */
export const heroSlides: { photo: PhotoKey; region: string; caption: string; alt: string }[] = [
  { photo: 'lake', region: '호숫가', caption: '물가 바위 정원 앞 전원주택', alt: '물가 바위 정원 앞 목조·석재 전원주택' },
  { photo: 'sea', region: '바닷가', caption: '모래 데크가 있는 유리 주택', alt: '바다가 보이는 모래 데크 유리 주택' },
  { photo: 'forest', region: '산속', caption: '숲에 둘러싸인 목재 주택', alt: '키 큰 나무에 둘러싸인 목재 외장 2층 주택' },
  { photo: 'suburb', region: '교외', caption: '잔디 마당의 목재·유리 주택', alt: '넓은 잔디 마당의 목재·유리 주택' },
  { photo: 'city', region: '도심', caption: '도시 전망 수영장 저택', alt: '도시가 내려다보이는 수영장 딸린 저택' },
]

export const levelSteps = [
  { no: 1, title: '부지', desc: '도심부터 호숫가까지, 집 지을 땅을 골라요.', bg: '#FFFFFF', fg: '#2B2A27', tilt: -1.5 },
  { no: 2, title: '설계', desc: '층수와 구조, 방 배치를 정해요.', bg: '#00A7E2', fg: '#2B2A27', tilt: 1 },
  { no: 3, title: '꾸미기', desc: '외관, 인테리어, 특수 시설을 골라요.', bg: '#FFD23F', fg: '#2B2A27', tilt: -1 },
  { no: 4, title: '시공', desc: '돌발 이벤트를 헤치고 빠르게 지어요.', bg: '#2B2A27', fg: '#FFFFFF', tilt: 1.5 },
  { no: 5, title: '완공', desc: '재난 테스트를 버티고 등급을 받아요.', bg: '#1032CF', fg: '#FFFFFF', tilt: -1 },
]

export const regionRows: { word: string; photo: PhotoKey; alt: string }[] = [
  { word: '호숫가', photo: 'lake', alt: '호숫가 전원주택' },
  { word: '바닷가', photo: 'sea', alt: '바닷가 유리 주택' },
  { word: '산속', photo: 'forest', alt: '숲속 목재 주택' },
  { word: '교외', photo: 'suburb', alt: '교외 잔디 마당 주택' },
  { word: '도심', photo: 'city', alt: '도심 전망 저택' },
]

export const popularHouses: {
  name: string
  region: string
  maker: string
  grade: string
  likes: string
  photo: PhotoKey
  alt: string
}[] = [
  { name: '호숫가의 봄', region: '호숫가', maker: '지윤', grade: 'S', likes: '1,284', photo: 'lake', alt: '호숫가 숲속의 목조·석재 전원주택' },
  { name: '파도 소리 하우스', region: '바닷가', maker: '바다곰', grade: 'A', likes: '962', photo: 'sea', alt: '모래 데크와 바다가 보이는 유리 주택' },
  { name: '숲속 다락방', region: '산속', maker: '솔방울', grade: 'A', likes: '711', photo: 'forest', alt: '키 큰 나무에 둘러싸인 목재 외장 2층 주택' },
  { name: '도심 옥상정원', region: '도심', maker: '시티러버', grade: 'B', likes: '538', photo: 'city', alt: '도시가 내려다보이는 수영장 딸린 저택' },
]

/* ---------- 부지 선택 ---------- */
export type Risk = '낮음' | '보통' | '높음'
export const riskColors: Record<Risk, string> = { 낮음: '#9BD35A', 보통: '#FFD23F', 높음: '#FF6A5E' }

export type SiteId = 'core' | 'edge' | 'suburb' | 'sea' | 'mountain' | 'lake'
export const sites: {
  id: SiteId
  photo: PhotoKey
  alt: string
  name: string
  size: string
  cost: number
  view: number
  access: number
  risk: Risk
  desc: string
}[] = [
  { id: 'core', photo: 'citycore', alt: '멀리 보이는 도시 중심부의 빽빽한 건물들', name: '도시 중심부', size: '80평', cost: 35, view: 2, access: 5, risk: '보통', desc: '모든 게 가까운 도시 한복판. 땅이 가장 비싸고 좁아서 높이 올리는 설계가 필수예요.' },
  { id: 'edge', photo: 'city', alt: '도시가 내려다보이는 언덕 위 수영장 저택', name: '도심 외곽', size: '150평', cost: 20, view: 4, access: 4, risk: '낮음', desc: '도심까지 금방이면서 언덕 위에서 도시 전망을 누려요. 가격과 편리함의 균형이 좋아요.' },
  { id: 'suburb', photo: 'suburb', alt: '넓은 잔디 마당의 목재·유리 주택', name: '교외', size: '250평', cost: 12, view: 3, access: 3, risk: '낮음', desc: '넓고 무난한 땅. 마당과 차고를 넉넉하게 넣을 수 있어요.' },
  { id: 'sea', photo: 'sea', alt: '바다 앞 모래 데크 유리 주택', name: '바닷가', size: '200평', cost: 15, view: 5, access: 2, risk: '높음', desc: '탁 트인 바다 조망. 태풍에 대비한 구조 설계가 필요해요.' },
  { id: 'mountain', photo: 'forest', alt: '숲으로 둘러싸인 목재 외장 주택', name: '산속', size: '400평', cost: 8, view: 4, access: 1, risk: '보통', desc: '가장 넓고 저렴하지만 길이 멀어요. 산사태에 주의하세요.' },
  { id: 'lake', photo: 'lake', alt: '물가 바위 정원 앞 전원주택', name: '호숫가', size: '220평', cost: 14, view: 5, access: 2, risk: '보통', desc: '잔잔한 호수 앞 전원 부지. 비가 많이 오면 물이 넘칠 수 있어요.' },
]

/* ---------- 견적 ---------- */
export type SpecKey = 'site' | 'struct' | 'plan' | 'look' | 'extra'
export type SpecOption = { id: string; grade: Grade; name: string; detail: string; cost: number }

export const catalog: Record<SpecKey, { title: string; options: SpecOption[] }> = {
  site: {
    title: '부지',
    options: [
      { id: 'mountain', grade: '실속', name: '산속 400평', detail: '가장 넓고 저렴. 길이 멀고 산사태 주의', cost: 8 },
      { id: 'suburb', grade: '실속', name: '교외 250평', detail: '넓고 무난, 재해 위험 낮음', cost: 12 },
      { id: 'lake', grade: '표준', name: '호숫가 220평', detail: '잔잔한 호수 조망, 홍수 주의', cost: 14 },
      { id: 'sea', grade: '표준', name: '바닷가 200평', detail: '최고의 바다 조망, 태풍 주의', cost: 15 },
      { id: 'edge', grade: '고급', name: '도심 외곽 150평', detail: '언덕 위 도시 전망, 편리함과 균형', cost: 20 },
      { id: 'core', grade: '프리미엄', name: '도시 중심부 80평', detail: '모든 게 가까운 한복판, 가장 비쌈', cost: 35 },
    ],
  },
  struct: {
    title: '구조',
    options: [
      { id: 's1', grade: '실속', name: '목조 · 내진 3등급', detail: '1층 단독. 가볍고 빠르지만 재난에 약해요', cost: 16 },
      { id: 's2', grade: '표준', name: '철근콘크리트 · 내진 2등급', detail: '2층. 무난한 안전성', cost: 22 },
      { id: 's3', grade: '고급', name: '철근콘크리트 · 내진 1등급', detail: '2층. 지진에 강한 튼튼한 구조', cost: 28 },
      { id: 's4', grade: '프리미엄', name: '스틸 · 면진 구조', detail: '3층. 흔들림을 흡수하는 최고 안전 등급', cost: 36 },
    ],
  },
  plan: {
    title: '평면',
    options: [
      { id: 'p1', grade: '실속', name: '방 5개', detail: '거실·주방·침실 2·욕실 1', cost: 10 },
      { id: 'p2', grade: '표준', name: '방 7개', detail: '침실 3·욕실 2·드레스룸', cost: 14 },
      { id: 'p3', grade: '고급', name: '방 9개', detail: '침실 4·욕실 3·서재·드레스룸', cost: 18 },
      { id: 'p4', grade: '프리미엄', name: '방 12개 · 지하층', detail: '게스트룸·와인셀러·지하 작업실까지', cost: 26 },
    ],
  },
  look: {
    title: '외관·인테리어',
    options: [
      { id: 'l1', grade: '실속', name: '모던 심플', detail: '깔끔한 화이트 톤 · 기본 마감', cost: 12 },
      { id: 'l2', grade: '표준', name: '전원주택 스타일', detail: '원목 마감 · 따뜻한 우드 톤', cost: 21.5 },
      { id: 'l3', grade: '고급', name: '한옥 스타일', detail: '기와 지붕 · 한지 창호 마감', cost: 28 },
      { id: 'l4', grade: '프리미엄', name: '유럽풍 저택', detail: '대리석 마감 · 샹들리에', cost: 38 },
    ],
  },
  extra: {
    title: '특수 시설',
    options: [
      { id: 'e1', grade: '실속', name: '텃밭 · 차고', detail: '소소하지만 실용적인 구성', cost: 4 },
      { id: 'e2', grade: '표준', name: '옥상정원 · 홈시어터', detail: '휴식과 취미를 위한 공간', cost: 12 },
      { id: 'e3', grade: '고급', name: '+ 수영장', detail: '옥상정원 · 홈시어터 · 수영장', cost: 15.5 },
      { id: 'e4', grade: '프리미엄', name: '+ 수영장 · 사우나', detail: '집 안에서 즐기는 리조트', cost: 20 },
    ],
  },
}

export const specOrder: SpecKey[] = ['site', 'struct', 'plan', 'look', 'extra']

/** The design's default selection. */
export const defaultSpec: Record<SpecKey, string> = {
  site: 'lake',
  struct: 's3',
  plan: 'p3',
  look: 'l2',
  extra: 'e2',
}

/** Formats an amount in 억 the way the design does (minus sign, one decimal). */
export function formatEok(value: number): string {
  return (Math.round(value * 10) / 10).toString().replace('-', '−') + '억'
}
