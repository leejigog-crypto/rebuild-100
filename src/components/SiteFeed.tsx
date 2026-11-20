import { useEffect, useState, type CSSProperties } from 'react'
import constructionImg from '../assets/images/construction.png'
import buildImg from '../assets/images/build.png'
import './SiteFeed.css'

const shots = [
  { src: buildImg, alt: '철골 벽체 사이에 노란 단열재를 끼워 넣는 작업자와 쌓여 있는 석고보드', position: '60% 40%' },
  { src: constructionImg, alt: '안전모를 쓴 작업자들이 철골 벽체에 석고보드를 붙이고 치수를 재는 실내 공사 현장', position: '50% 35%' },
]

/** 사진이 바뀌는 간격 */
const SLIDE_MS = 5000
/** 날리는 먼지 알갱이 수 */
const DUST = Array.from({ length: 14 }, (_, i) => i)

/**
 * 공사 현장 "실시간" 화면: 두 사진을 번갈아 보여 주며 천천히 움직이고,
 * 드릴 진동처럼 짧게 흔들리고, 먼지가 날립니다. `active`가 false(일시정지·대기)면 모두 멈춥니다.
 */
export function SiteFeed({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % shots.length), SLIDE_MS)
    return () => window.clearInterval(id)
  }, [active])

  return (
    <div className={`site-feed${active ? ' is-active' : ''}`}>
      <div className="site-feed__rig">
        {shots.map((shot, i) => (
          <img
            key={shot.src}
            src={shot.src}
            alt={i === index ? shot.alt : ''}
            aria-hidden={i === index ? undefined : true}
            className={`site-feed__img site-feed__img--${i}${i === index ? ' is-on' : ''}`}
            style={{ objectPosition: shot.position }}
          />
        ))}
      </div>
      <div className="site-feed__dust" aria-hidden="true">
        {DUST.map((i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      <div className="site-feed__flash" aria-hidden="true" key={index} />
    </div>
  )
}
