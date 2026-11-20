import { useEffect, useState } from 'react'
import { CharacterCue, type Mood } from '../components/CharacterCue'
import { useCharacterCue } from '../hooks/useCharacterCue'
import { randomHousePhoto } from '../data/houses'
import { Link } from 'react-router-dom'
import { BudgetHud } from '../components/BudgetHud'
import { Dialog } from '../components/Dialog'
import { GameScreen } from '../components/GameScreen'
import { DoubleChevron, SmallCloseIcon } from '../components/Icons'
import { ArrowLink, StageBar } from '../components/StageBar'
import { formatTenth } from '../data/buildEvents'
import { loadBuildResult } from '../data/buildResult'
import { gradeColors } from '../data/game'
import { loadHouseName, loadSpec } from '../data/progress'
import { computeResult } from '../data/scoring'
import { usePreviewDialog } from '../hooks/usePreviewDialog'
import './ResultPage.css'

/** 등급별 캐릭터 표정과 대사 */
const gradeReactions: Record<string, [Mood, string]> = {
  S: ['happy', 'S등급! 꿈의 집이 완성됐어요!'],
  A: ['happy', 'A등급! 이 정도면 자랑할 만해요!'],
  B: ['default', 'B등급. 나쁘지 않은 집이에요.'],
  C: ['sad', 'C등급… 다음엔 더 튼튼하게 지어요.'],
}

export function ResultPage() {
  const dialog = usePreviewDialog<'share'>()
  // 견적 선택 + 시공 결과(없으면 견적의 남은 예산)로 점수를 냅니다.
  const [result] = useState(() => computeResult(loadSpec(), loadBuildResult()))
  const [defaultHouseName] = useState(loadHouseName)
  const { failed, remainTenth } = result
  const remainLabel = `${formatTenth(remainTenth)}억`
  const spentLabel = `${formatTenth(result.spentTenth)}억`
  // 등급에 맞는 집 사진을 한 번만 무작위로 고릅니다.
  const [housePhoto] = useState(() => randomHousePhoto(result.grade))
  const housePhotoStyle = { backgroundImage: `url(${housePhoto})` }

  const character = useCharacterCue()
  const { showLater } = character
  useEffect(() => {
    if (failed) {
      // "준공 실패" 글자가 쾅 찍힌 직후
      showLater(1100, 'sad', '예산을 넘기다니… 다시 해 봐요.')
      return
    }
    // 등급 도장이 찍히는 2.6초 뒤에 등급별 반응
    const [mood, line] = gradeReactions[result.grade] ?? gradeReactions.B
    showLater(3200, mood, line)
  }, [failed, result.grade, showLater])

  if (failed) {
    return (
      <GameScreen
        photo={result.sitePhoto}
        photoAlt={`배경: ${result.siteName} 부지 풍경`}
        align="start"
        shade="linear-gradient(180deg, rgba(60,8,6,0.55) 0%, rgba(43,42,39,0.55) 45%, rgba(43,42,39,0.92) 100%)"
        hud={<BudgetHud houseName={defaultHouseName} remaining={remainLabel} fillPercent={100} fill="var(--stripe-danger)" />}
      >
        <section className="result-fail" aria-labelledby="failTitle">
          <span className="result-fail__tag">재난 테스트 불가 · 예산 초과</span>
          <h1 id="failTitle" className="result-fail__title">
            준공 실패
          </h1>
          <p className="result-fail__desc">
            공사 중 추가 비용으로 지원금 100억을 <strong>{formatTenth(-remainTenth)}억</strong> 넘겼어요.
            <br />
            예산 안에서 다시 지어 보세요.
          </p>
          <div className="result-fail__money">
            <span>
              사용한 예산 <strong>{spentLabel}</strong>
            </span>
            <span>
              초과 금액 <strong className="is-red">{formatTenth(-remainTenth)}억</strong>
            </span>
          </div>
          <div className="result-fail__actions">
            <Link to="/build" className="btn btn--primary">
              다시 시공하기 <DoubleChevron />
            </Link>
            <Link to="/estimate" className="btn btn--accent">
              견적 다시 짜기
            </Link>
          </div>
        </section>

        <StageBar level={5} current={4}>
          <Link to="/" className="result__home-link">
            내 집 목록
          </Link>
          <ArrowLink to="/intro">새 집 짓기</ArrowLink>
        </StageBar>
        <CharacterCue cue={character.cue} onDone={character.done} />
      </GameScreen>
    )
  }

  return (
    <GameScreen
      photo={result.sitePhoto}
      photoAlt={`배경: ${result.siteName} 부지 풍경`}
      photoEffect="wake"
      align="start"
      shade="linear-gradient(180deg, rgba(43,42,39,0.30) 0%, rgba(43,42,39,0.0) 30%, rgba(43,42,39,0.30) 58%, rgba(43,42,39,0.88) 100%)"
      hud={<BudgetHud houseName={defaultHouseName} remaining={remainLabel} fillPercent={remainTenth / 10} />}
      dialog={
        dialog.current === 'share' && (
          <Dialog titleId="shareTitle" maxWidth={480} offsetTop={220} onClose={dialog.close}>
            <div className="share-dialog__head">
              <h2 id="shareTitle" className="share-dialog__title">
                자랑하기
              </h2>
              <button type="button" className="dialog__close" aria-label="닫기" onClick={dialog.close}>
                <SmallCloseIcon />
              </button>
            </div>
            <div className="share-dialog__body">
              <div className="share-card">
                <div className="share-card__photo photo" aria-hidden="true" style={housePhotoStyle} />
                <div className="share-card__text">
                  <strong>
                    {defaultHouseName} · {result.grade}등급
                  </strong>
                  <span className="share-card__score">
                    종합 {result.total}점 · {result.title}
                  </span>
                  <span className="share-card__pitch">100억으로 지은 내 집, 너도 지어 볼래?</span>
                </div>
              </div>
              <div className="share-dialog__link">
                <label htmlFor="shareLink" className="sr-only">
                  공유 링크
                </label>
                <input id="shareLink" type="text" readOnly value="100rebuild.example/h/[공유 링크]" />
                <button type="button">링크 복사</button>
              </div>
              <div className="share-dialog__channels">
                <button type="button">카카오톡</button>
                <button type="button">인스타그램</button>
                <button type="button">X</button>
              </div>
            </div>
          </Dialog>
        )
      }
    >
      <div className="stage-head rise-1">
        <span className="result__pass">재난 테스트 통과 · 지진 ✓ 태풍 ✓ 홍수 ✓</span>
        <h1 className="stroke-title result__title">준공 완료!</h1>
        <p className="caption">
          {defaultHouseName} · {result.siteName} · {result.lookName} — 당신이 고른 스펙으로 완성된 집이에요.
        </p>
      </div>

      <section aria-label="완성된 집" className="result__house">
        <div role="img" aria-label={result.photoAlt} className="result__photo photo" style={housePhotoStyle}>
          <span className="result__stamp">MY HOUSE</span>
        </div>
        <div className="result__house-foot">
          <strong className="result__house-name">{defaultHouseName}</strong>
          <div className="result__chips">
            {result.specs.map((s) => (
              <span key={s.label} className="chip result__chip" style={{ background: gradeColors[s.grade].bg, color: gradeColors[s.grade].fg }}>
                {s.grade} · {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="result__panels">
        <section aria-label="종합 등급" className="result__grade-panel glass rise-2">
          <div className="result__grade" aria-label={`종합 등급 ${result.grade}`}>
            {result.grade}
          </div>
          <div className="result__grade-info">
            <span className="result__label">종합 점수</span>
            <strong className="result__total">
              {result.total}
              <span> /100</span>
            </strong>
            <span className="result__badge">칭호 획득 · {result.title}</span>
          </div>
        </section>

        <section aria-label="항목별 점수" className="result__scores card rise-2">
          {result.scores.map((s) => (
            <div key={s.label} className="score-row">
              <span className="score-row__label">{s.label}</span>
              <div role="img" aria-label={`${s.label} ${s.value}점`} className="score-row__track">
                <div className="score-row__fill" style={{ width: `${s.value}%`, background: s.value >= 90 ? 'var(--orange)' : 'var(--sky)' }} />
              </div>
              <strong className="score-row__value">{s.value}</strong>
            </div>
          ))}
        </section>

        <section aria-label="예산과 다음 행동" className="result__actions glass rise-3">
          <div className="result__money">
            <div className="result__money-card">
              <span>사용한 예산</span>
              <strong>{spentLabel}</strong>
            </div>
            <div className="result__money-card is-remain">
              <span>남은 예산</span>
              <strong>{remainLabel}</strong>
            </div>
          </div>
          {/* TODO(기능): 갤러리 공개 */}
          <button type="button" className="btn btn--accent">
            갤러리에 공개
          </button>
          <button type="button" className="btn btn--primary" onClick={() => dialog.open('share')}>
            공유하기 <DoubleChevron />
          </button>
        </section>
      </div>

      <StageBar level={5} current={4} complete>
        <Link to="/" className="result__home-link">
          내 집 목록
        </Link>
        <ArrowLink to="/intro">새 집 짓기</ArrowLink>
      </StageBar>
      <CharacterCue cue={character.cue} onDone={character.done} />
    </GameScreen>
  )
}
