/**
 * 완공 결과 집 사진 (무료 라이선스, 출처: src/assets/houses/CREDITS.md).
 * 파일명이 사진 키: s-1 … c-3 (앞글자가 등급). 서버에는 이 키만 저장합니다.
 */
const files = import.meta.glob<string>('../assets/houses/*.jpg', { eager: true, import: 'default' })

export type HouseGrade = 'S' | 'A' | 'B' | 'C'

const urlByKey: Record<string, string> = {}
const keysByGrade: Record<HouseGrade, string[]> = { S: [], A: [], B: [], C: [] }

for (const [path, url] of Object.entries(files)) {
  const key = path.split('/').pop()!.replace(/\.jpg$/, '')
  urlByKey[key] = url
  const grade = key[0].toUpperCase() as HouseGrade
  if (grade in keysByGrade) keysByGrade[grade].push(key)
}

/** 등급에 맞는 사진 키를 무작위로 고릅니다. */
export function randomHousePhotoKey(grade: string): string {
  const pool = keysByGrade[(grade as HouseGrade) in keysByGrade ? (grade as HouseGrade) : 'B']
  return pool[Math.floor(Math.random() * pool.length)]
}

export function housePhotoUrl(key: string): string {
  return urlByKey[key] ?? urlByKey['b-1']
}
