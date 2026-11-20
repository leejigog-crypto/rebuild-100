/**
 * 완공 결과 집 사진 (무료 라이선스, 출처: src/assets/houses/CREDITS.md).
 * 파일명 앞글자가 등급: s-*.jpg, a-*.jpg, b-*.jpg, c-*.jpg
 */
const files = import.meta.glob<string>('../assets/houses/*.jpg', { eager: true, import: 'default' })

export type HouseGrade = 'S' | 'A' | 'B' | 'C'

const byGrade: Record<HouseGrade, string[]> = { S: [], A: [], B: [], C: [] }
for (const [path, url] of Object.entries(files)) {
  const grade = path.split('/').pop()?.[0]?.toUpperCase() as HouseGrade | undefined
  if (grade && grade in byGrade) byGrade[grade].push(url)
}

/** 등급에 맞는 집 사진 하나를 무작위로 고릅니다. */
export function randomHousePhoto(grade: string): string {
  const pool = byGrade[(grade as HouseGrade) in byGrade ? (grade as HouseGrade) : 'B']
  return pool[Math.floor(Math.random() * pool.length)]
}
