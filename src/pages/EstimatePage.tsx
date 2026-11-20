import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BudgetHud } from '../components/BudgetHud'
import { Dialog } from '../components/Dialog'
import { GameScreen } from '../components/GameScreen'
import { DoubleChevron, SmallCloseIcon } from '../components/Icons'
import { ArrowLink, StageBar } from '../components/StageBar'
import { catalog, formatEok, gradeColors, specOrder, type SpecKey } from '../data/game'
import { loadHouseName, loadSpec, resolveSpec, saveSpec, type Spec } from '../data/progress'
import { usePreviewDialog } from '../hooks/usePreviewDialog'
import './EstimatePage.css'

type DialogName = `edit-${SpecKey}` | 'confirm'

export function EstimatePage() {
  const dialog = usePreviewDialog<DialogName>()
  const [spec, setSpec] = useState<Spec>(loadSpec)
  const [houseName] = useState(loadHouseName)

  const { options: current, spent, remain } = resolveSpec(spec)
  const over = remain < 0

  const editing = dialog.current?.startsWith('edit-') ? (dialog.current.slice(5) as SpecKey) : null

  const choose = (key: SpecKey, id: string) => {
    const next = { ...spec, [key]: id }
    setSpec(next)
    saveSpec(next)
    dialog.close()
  }

  return (
    <GameScreen
      photo="city"
      photoAlt="배경: 도시가 내려다보이는 수영장 딸린 저택"
      shade="linear-gradient(180deg, rgba(43,42,39,0.35) 0%, rgba(43,42,39,0.10) 30%, rgba(43,42,39,0.40) 60%, rgba(43,42,39,0.88) 100%)"
      hud={
        <BudgetHud
          houseName={houseName}
          remaining={formatEok(remain)}
          fillPercent={over ? 100 : remain}
          fill={over ? 'var(--stripe-danger)' : 'var(--orange)'}
        />
      }
      dialog={
        <>
          {editing && (
            <Dialog titleId="editTitle" stripe="warning" maxWidth={860} offsetTop={200} onClose={dialog.close}>
              <div className="edit-dialog">
                <div className="edit-dialog__head">
                  <div className="edit-dialog__heading">
                    <h2 id="editTitle" className="dialog-title">
                      {catalog[editing].title} 변경
                    </h2>
                    <span className="edit-dialog__hint">
                      등급을 골라 보세요. 지금 남은 예산 <strong>{formatEok(remain)}</strong>
                    </span>
                  </div>
                  <button type="button" className="dialog__close" aria-label="닫기" onClick={dialog.close}>
                    <SmallCloseIcon />
                  </button>
                </div>
                <div className="edit-dialog__grid">
                  {catalog[editing].options.map((o) => {
                    const isCurrent = o.id === current[editing].id
                    const diff = Math.round((o.cost - current[editing].cost) * 10) / 10
                    const g = gradeColors[o.grade]
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={isCurrent}
                        className={`option-card${isCurrent ? ' is-current' : ''}`}
                        onClick={() => choose(editing, o.id)}
                      >
                        <span className="option-card__top">
                          <span className="chip" style={{ background: g.bg, color: g.fg, fontSize: 13, padding: '2px 10px' }}>
                            {o.grade}
                          </span>
                          <span className="option-card__mark">{isCurrent ? '✓ 현재 선택' : ''}</span>
                        </span>
                        <strong className="option-card__name">{o.name}</strong>
                        <span className="option-card__detail">{o.detail}</span>
                        <span className="option-card__foot">
                          <strong className="option-card__price">{formatEok(o.cost)}</strong>
                          {!isCurrent && (
                            <span className={`option-card__diff ${diff > 0 ? 'is-up' : 'is-down'}`}>
                              {diff > 0 ? '+' : ''}
                              {formatEok(diff)}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </Dialog>
          )}
          {dialog.current === 'confirm' && !over && (
            <Dialog titleId="confirmTitle" stripe="hazard" maxWidth={460} tilt={-1} offsetTop={260} onClose={dialog.close}>
              <div className="confirm-dialog">
                <h2 id="confirmTitle" className="dialog-title">
                  정말 착공할까요?
                </h2>
                <p>착공하면 부지·설계·꾸미기를 바꿀 수 없어요.</p>
                <div className="confirm-dialog__actions">
                  <button type="button" className="btn--plain" onClick={dialog.close}>
                    취소
                  </button>
                  <Link to="/build" className="btn btn--primary">
                    착공! <DoubleChevron />
                  </Link>
                </div>
              </div>
            </Dialog>
          )}
        </>
      }
    >
      <div className="stage-head rise-1">
        <span className="tag" style={{ background: 'var(--yellow)' }}>
          STAGE 3 · ESTIMATE
        </span>
        <h1 className="stroke-title">견적을 확인하세요</h1>
        <p className="caption">착공하면 설계를 다시 바꿀 수 없어요. 지출 내역을 꼼꼼히 살펴보세요.</p>
      </div>

      <div className="estimate__totals rise-2">
        <div className="estimate__total glass">
          <span>총 예산</span>
          <strong>100억</strong>
        </div>
        <div className="estimate__total glass">
          <span>총 지출</span>
          <strong>{formatEok(spent)}</strong>
        </div>
        <div className={`estimate__total estimate__total--remain card${over ? ' is-over' : ''}`}>
          <span>남은 예산</span>
          <strong>{formatEok(remain)}</strong>
        </div>
      </div>

      <div className="estimate__layout">
        <section aria-label="항목별 지출" className="estimate__table-wrap card rise-3">
          <table className="estimate__table">
            <thead>
              <tr>
                <th scope="col">항목</th>
                <th scope="col">내용</th>
                <th scope="col" className="is-right">
                  금액
                </th>
                <th scope="col" className="is-right">
                  수정
                </th>
              </tr>
            </thead>
            <tbody>
              {specOrder.map((k) => {
                const o = current[k]
                const g = gradeColors[o.grade]
                return (
                  <tr key={k}>
                    <th scope="row">{catalog[k].title}</th>
                    <td>
                      <span className="chip estimate__grade" style={{ background: g.bg, color: g.fg }}>
                        {o.grade}
                      </span>
                      {o.name}
                    </td>
                    <td className="is-right estimate__amount">{formatEok(o.cost)}</td>
                    <td className="is-right estimate__edit-cell">
                      <button type="button" className="estimate__edit" aria-label={`${catalog[k].title} 수정`} onClick={() => dialog.open(`edit-${k}`)}>
                        수정
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <aside className="estimate__side rise-3">
          {over && (
            <div role="alert" className="estimate__alert">
              <strong>예산을 {formatEok(-remain)} 초과했어요</strong>
              <span>각 항목의 [수정]을 눌러 더 낮은 등급으로 바꿔 보세요. 예산 안으로 맞춰야 착공할 수 있어요.</span>
            </div>
          )}
          <div className="estimate__start card">
            <div aria-hidden="true" className="estimate__stripe" />
            <div className="estimate__start-body">
              <strong className="estimate__start-title">이제 공사를 시작할까요?</strong>
              <span className="estimate__start-text">착공 후에는 공사 중 돌발 이벤트가 생길 수 있어요. 남은 예산이 위기 대응 자금이 됩니다.</span>
              {over ? (
                <button type="button" className="btn" disabled>
                  착공하기
                </button>
              ) : (
                <button type="button" className="btn btn--primary" onClick={() => dialog.open('confirm')}>
                  착공하기 <DoubleChevron />
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      <StageBar level={3} current={2}>
        <ArrowLink to="/site" direction="left" ariaLabel="이전 화면 (꾸미기)">
          이전
        </ArrowLink>
      </StageBar>
    </GameScreen>
  )
}
