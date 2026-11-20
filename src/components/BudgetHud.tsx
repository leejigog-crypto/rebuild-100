import './BudgetHud.css'

type Props = {
  houseName: string
  /** 표시할 남은 예산, 예: "6.5억" */
  remaining: string
  /** 바 채움 폭(%) */
  fillPercent: number
  /** 바 채움 배경 (단색·줄무늬) */
  fill?: string
}

/** Top-center glass HUD showing the remaining budget out of 100억. */
export function BudgetHud({ houseName, remaining, fillPercent, fill = 'var(--orange)' }: Props) {
  return (
    <div className="budget-hud glass">
      <div className="budget-hud__row">
        <span className="budget-hud__label">{houseName} · 남은 예산</span>
        <span className="budget-hud__value">
          <strong>{remaining}</strong> / 100억
        </span>
      </div>
      <div
        className="budget-hud__track"
        role="progressbar"
        aria-label="남은 예산 비율"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fillPercent)}
      >
        <div className="budget-hud__fill" style={{ width: `${fillPercent}%`, background: fill }} />
      </div>
    </div>
  )
}
