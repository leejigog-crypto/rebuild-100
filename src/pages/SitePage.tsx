import { Link } from 'react-router-dom'
import { BudgetHud } from '../components/BudgetHud'
import { GameScreen } from '../components/GameScreen'
import { DoubleChevron } from '../components/Icons'
import { ArrowLink, StageBar } from '../components/StageBar'
import { defaultHouseName, defaultSpec, riskColors, sites } from '../data/game'
import { photoStyle } from '../data/images'
import './SitePage.css'

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export function SitePage() {
  // TODO(기능): 부지 선택 상태. 지금은 기본값(호숫가)이 선택된 모습입니다.
  const selected = sites.find((s) => s.id === defaultSpec.site) ?? sites[0]
  const afterPurchase = 100 - selected.cost

  return (
    <GameScreen
      photo={selected.photo}
      photoAlt={`배경: ${selected.alt}`}
      shade="linear-gradient(180deg, rgba(43,42,39,0.35) 0%, rgba(43,42,39,0.10) 30%, rgba(43,42,39,0.35) 60%, rgba(43,42,39,0.85) 100%)"
      hud={
        <BudgetHud
          houseName={defaultHouseName}
          remaining="100억"
          fillPercent={100}
          fill={`linear-gradient(90deg, var(--orange) 0 ${afterPurchase}%, var(--yellow) ${afterPurchase}% 100%)`}
        />
      }
    >
      <div className="stage-head rise-1">
        <span className="tag" style={{ background: 'var(--yellow)' }}>
          STAGE 2 · SITE
        </span>
        <h1 className="stroke-title">어떤 땅에 지어 볼까요?</h1>
        <p className="caption">6개 지역마다 땅값·크기·조망·재해 위험이 달라요. 배경은 선택한 지역의 집 분위기예요.</p>
      </div>

      <div className="site__layout">
        <div className="site__grid rise-2">
          {sites.map((s) => {
            const isSelected = s.id === selected.id
            return (
              <button key={s.id} type="button" aria-pressed={isSelected} className={`site-card${isSelected ? ' is-selected' : ''}`}>
                <span className="site-card__photo photo" aria-hidden="true" style={photoStyle(s.photo)}>
                  <span className="site-card__name">{s.name}</span>
                  <span className="site-card__size">{s.size}</span>
                </span>
                <span className="site-card__stats">
                  <span className="site-card__row">
                    <span>땅값</span>
                    <strong className="site-card__price">{s.cost}억</strong>
                  </span>
                  <span className="site-card__row">
                    <span>조망</span>
                    <span className="site-card__stars" aria-label={`조망 ${s.view}점 만점 5점`}>
                      {stars(s.view)}
                    </span>
                  </span>
                  <span className="site-card__row">
                    <span>접근성</span>
                    <span className="site-card__stars" aria-label={`접근성 ${s.access}점 만점 5점`}>
                      {stars(s.access)}
                    </span>
                  </span>
                  <span className="site-card__row">
                    <span>재해 위험</span>
                    <span className="chip" style={{ background: riskColors[s.risk] }}>
                      {s.risk}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <aside aria-label="선택한 땅 정보" className="site__detail glass rise-3">
          <span className="site__eyebrow">SELECTED</span>
          <strong className="site__selected">
            {selected.name} · {selected.size}
          </strong>
          <p className="site__desc">{selected.desc}</p>
          <div className="site__receipt card">
            <span className="site__line">
              <span>현재 예산</span>
              <span>100억</span>
            </span>
            <span className="site__line">
              <span>땅값</span>
              <span>− {selected.cost}억</span>
            </span>
            <span className="site__rule" aria-hidden="true" />
            <span className="site__line site__line--total">
              <strong>구매 후 남은 예산</strong>
              <strong className="site__after">{afterPurchase}억</strong>
            </span>
          </div>
          <Link to="/estimate" className="btn btn--primary" style={{ fontSize: 22 }}>
            이 땅 구매하고 다음 <DoubleChevron />
          </Link>
        </aside>
      </div>

      <StageBar level={2} current={1}>
        <ArrowLink to="/intro" direction="left" ariaLabel="이전 화면">
          이전
        </ArrowLink>
        <ArrowLink to="/estimate" ariaLabel="다음 화면">
          다음
        </ArrowLink>
      </StageBar>
    </GameScreen>
  )
}
