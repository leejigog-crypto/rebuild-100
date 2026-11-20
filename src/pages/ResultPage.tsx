import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BudgetHud } from '../components/BudgetHud'
import { CharacterCue, type Mood } from '../components/CharacterCue'
import { GameScreen } from '../components/GameScreen'
import { DoubleChevron } from '../components/Icons'
import { ShareDialog } from '../components/ShareDialog'
import { ArrowLink, StageBar } from '../components/StageBar'
import { toast } from '../lib/toast'
import { formatTenth } from '../data/buildEvents'
import { loadBuildResult } from '../data/buildResult'
import { gradeColors } from '../data/game'
import { housePhotoUrl, randomHousePhotoKey } from '../data/houses'
import { loadHouseName, loadProfile, loadSpec } from '../data/progress'
import { computeResult } from '../data/scoring'
import { useCharacterCue } from '../hooks/useCharacterCue'
import { usePreviewDialog } from '../hooks/usePreviewDialog'
import { saveHouse, setHousePublic } from '../lib/api'
import { isServerEnabled } from '../lib/supabase'
import './ResultPage.css'

/** 같은 시공 회차는 다시 들어와도 같은 사진을 보여 줍니다. */
function stablePhotoKey(runId: string | undefined, grade: string): string {
  const key = runId ? `rebuild.photo.${runId}` : null
  try {
    const saved = key && window.sessionStorage.getItem(key)
    if (saved && saved[0].toUpperCase() === grade) return saved
  } catch {
    /* ignore */
  }
  const picked = randomHousePhotoKey(grade)
  try {
    if (key) window.sessionStorage.setItem(key, picked)
  } catch {
    /* ignore */
  }
  return picked
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

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
  const [build] = useState(loadBuildResult)
  const [result] = useState(() => computeResult(loadSpec(), build))
  const [defaultHouseName] = useState(loadHouseName)
  const { failed, remainTenth } = result
  const remainLabel = `${formatTenth(remainTenth)}억`
  const spentLabel = `${formatTenth(result.spentTenth)}억`
  // 등급에 맞는 집 사진 (같은 회차는 같은 사진)
  const [photoKey] = useState(() => stablePhotoKey(build?.id, result.grade))
  const housePhotoStyle = { backgroundImage: `url(${housePhotoUrl(photoKey)})` }

  // 시공을 마치고 들어온 경우에만 완공한 집을 서버에 저장합니다.
  const canSave = isServerEnabled && !failed && build !== null
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isPublic, setIsPublic] = useState(false)
  const savingRef = useRef<Promise<boolean> | null>(null)

  useEffect(() => {
    if (!canSave || !build || savingRef.current) return
    setSaveState('saving')
    const spec = loadSpec()
    savingRef.current = saveHouse({
      id: build.id,
      player_name: loadProfile().player.trim().slice(0, 12),
      house_name: defaultHouseName.slice(0, 16),
      spec,
      site_name: result.siteName,
      look_name: result.lookName,
      grade: result.grade as 'S' | 'A' | 'B' | 'C',
      total: result.total,
      title: result.title,
      scores: result.scores,
      remaining_tenth: result.remainTenth,
      photo: photoKey,
    })
    savingRef.current.then((ok) => setSaveState(ok ? 'saved' : 'error'))
  }, [canSave, build, defaultHouseName, result, photoKey])

  const publish = async (next: boolean): Promise<boolean> => {
    if (!build || !(await savingRef.current)) {
      toast('아직 서버에 저장되지 않았어요.', 'error')
      return false
    }
    const ok = await setHousePublic(build.id, next)
    if (ok) setIsPublic(next)
    toast(ok ? (next ? '갤러리에 공개했어요!' : '갤러리에서 내렸어요.') : '바꾸지 못했어요. 잠시 뒤 다시 해 주세요.', ok ? 'ok' : 'error')
    return ok
  }

  const openShare = async () => {
    if (!canSave) {
      toast('시공을 마친 집만 공유할 수 있어요.', 'error')
      return
    }
    // 공유 링크는 공개된 집만 열리므로 먼저 공개합니다.
    if (!isPublic && !(await publish(true))) return
    dialog.open('share')
  }

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
          <Link to="/my" className="result__home-link">
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
        dialog.current === 'share' &&
        build &&
        isPublic && (
          <ShareDialog
            houseId={build.id}
            houseName={defaultHouseName}
            grade={result.grade}
            total={result.total}
            title={result.title}
            photo={photoKey}
            onClose={dialog.close}
          />
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
          <button
            type="button"
            className={`btn btn--accent${isPublic ? ' is-published' : ''}`}
            aria-pressed={isPublic}
            disabled={!canSave || saveState !== 'saved'}
            onClick={() => publish(!isPublic)}
          >
            {isPublic ? '공개 중 · 내리기' : '갤러리에 공개'}
          </button>
          <button type="button" className="btn btn--primary" disabled={!canSave || saveState !== 'saved'} onClick={openShare}>
            공유하기 <DoubleChevron />
          </button>
          <span className="result__save-note" role="status">
            {!isServerEnabled
              ? '서버 연결 준비 중이라 이 브라우저에만 남아요.'
              : !build
                ? '시공을 마치고 오면 내 집에 저장돼요.'
                : saveState === 'saving'
                  ? '내 집에 저장하는 중…'
                  : saveState === 'saved'
                    ? '내 집에 저장했어요 ✓'
                    : saveState === 'error'
                      ? '저장하지 못했어요. 새로고침해 다시 시도해 주세요.'
                      : ''}
          </span>
        </section>
      </div>

      <StageBar level={5} current={4} complete>
        <Link to="/my" className="result__home-link">
          내 집 목록
        </Link>
        <ArrowLink to="/intro">새 집 짓기</ArrowLink>
      </StageBar>
      <CharacterCue cue={character.cue} onDone={character.done} />
    </GameScreen>
  )
}
