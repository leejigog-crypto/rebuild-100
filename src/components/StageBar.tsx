import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { stageNames } from '../data/game'
import { BigChevrons } from './Icons'
import './StageBar.css'

type Props = {
  /** 1–5. 화면 왼쪽의 LV.n/5 */
  level: number
  /** 진행 중인 단계(0부터). `complete`이면 모든 단계 완료 표시 */
  current: number
  complete?: boolean
  /** 오른쪽의 이전/다음 등 행동 */
  children?: ReactNode
}

/** Bottom bar on every stage screen: LV badge, 5-segment progress, navigation. */
export function StageBar({ level, current, complete = false, children }: Props) {
  return (
    <div className="stage-bar">
      <span className="stage-bar__level">
        LV.{level}
        <span>/5</span>
      </span>
      <ol aria-label="진행 단계" className="stage-bar__steps">
        {stageNames.map((name, i) => {
          const state = complete || i < current ? 'done' : i === current ? 'current' : 'todo'
          return (
            <li key={name} className={`stage-bar__step is-${state}`} aria-current={i === current ? 'step' : undefined}>
              <span className="stage-bar__pill" />
              <span className="stage-bar__name">{name}</span>
            </li>
          )
        })}
      </ol>
      {children}
    </div>
  )
}

/** Outlined «/» text link used for 이전·다음·건너뛰기. */
export function ArrowLink({
  to,
  direction = 'right',
  children,
  ariaLabel,
}: {
  to: string
  direction?: 'left' | 'right'
  children: ReactNode
  ariaLabel?: string
}) {
  return (
    <Link to={to} className="arrow-link" aria-label={ariaLabel}>
      {direction === 'left' && <BigChevrons direction="left" />}
      {children}
      {direction === 'right' && <BigChevrons direction="right" />}
    </Link>
  )
}
