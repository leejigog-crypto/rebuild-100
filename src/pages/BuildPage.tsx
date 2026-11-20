import { useEffect, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import { BudgetHud } from '../components/BudgetHud'
import { Dialog } from '../components/Dialog'
import { GameScreen } from '../components/GameScreen'
import { DoubleChevron, PauseIcon, WarningIcon } from '../components/Icons'
import { CharacterCue, type Cue, type Mood } from '../components/CharacterCue'
import { StageBar } from '../components/StageBar'
import { describeChoice, formatTenth, scheduleEvents, statNames, type EventChoice, type ScheduledEvent, type StatName } from '../data/buildEvents'
import { clearBuildResult, emptyStats, saveBuildResult } from '../data/buildResult'
import { loadHouseName, loadSpec, resolveSpec } from '../data/progress'
import { SiteFeed } from '../components/SiteFeed'
import './BuildPage.css'

const phaseNames = ['기초', '골조', '외장', '내장', '준공']
const tasks = ['기초 콘크리트 타설', '철골 골조 세우기', '벽체 단열재 시공', '내부 마감 공사', '준공 검사']

const TICK_MS = 200
/** 속도 ×1 기준 전체 공사에 걸리는 틱 수 (약 90초) */
const TOTAL_TICKS = 450
/** 빠른 시공 비용 (0.1억 단위) */
const FAST_COST = 15
const START_DAYS = 32

type LogEntry = { key: number; title: string; choice: string; effect: string; tone: 'cost' | 'neutral' | 'good' }

type State = {
  progress: number
  budget: number
  totalDays: number
  fast: boolean
  paused: boolean
  /** 남은 정지 틱 (기다리기 선택 시) */
  stall: number
  schedule: ScheduledEvent[]
  /** 다음에 발생할 이벤트 순번 */
  next: number
  /** 지금 떠 있는 이벤트 순번, 없으면 -1 */
  active: number
  log: LogEntry[]
  logKey: number
  /** 돌발 상황 선택으로 누적된 점수 변화 */
  stats: Record<StatName, number>
  /** 돌발 상황으로 늘어난 기간(일) */
  extraDays: number
  /** 시공 회차 id (다시 시작하면 새로 발급) */
  runId: string
  /** 지금 등장한 캐릭터 반응 */
  cue: Cue | null
  cueId: number
}

type Action =
  | { type: 'tick' }
  | { type: 'choose'; choice: EventChoice }
  | { type: 'togglePause' }
  | { type: 'fast' }
  | { type: 'restart' }
  | { type: 'cueDone' }

function withCue(s: State, mood: Mood, line: string): Pick<State, 'cue' | 'cueId'> {
  return { cue: { id: s.cueId, mood, line }, cueId: s.cueId + 1 }
}

/** 선택 결과에 맞는 표정과 대사 */
function reactionFor(choice: EventChoice, budgetAfter: number): [Mood, string] {
  const cost = choice.cost ?? 0
  const stats = Object.values(choice.stats ?? {})
  if (budgetAfter < 0) return ['sad', '예산이… 넘어 버렸어요.']
  if (cost < 0 || stats.some((v) => v > 0)) return ['happy', '좋았어, 이득이다!']
  if (stats.some((v) => v < 0)) return ['sad', '찜찜하지만 어쩔 수 없죠…']
  if (choice.days) return ['sad', '공사가 좀 늦어지겠네요.']
  if (cost > 0) return ['default', '돈으로 깔끔하게 해결!']
  return ['default', '그냥 넘어가죠.']
}

function init(): State {
  // 견적에서 남긴 예산이 시공 예산이 됩니다.
  const { remain } = resolveSpec(loadSpec())
  return {
    runId: crypto.randomUUID(),
    stats: { ...emptyStats },
    extraDays: 0,
    progress: 0,
    budget: Math.round(remain * 10),
    totalDays: START_DAYS,
    fast: false,
    paused: false,
    stall: 0,
    schedule: scheduleEvents(),
    next: 0,
    active: -1,
    log: [],
    logKey: 0,
    cue: { id: 0, mood: 'default', line: '착공! 잘 부탁해요.' },
    cueId: 1,
  }
}

function addLog(s: State, entry: Omit<LogEntry, 'key'>): Pick<State, 'log' | 'logKey'> {
  return { log: [{ ...entry, key: s.logKey }, ...s.log], logKey: s.logKey + 1 }
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'tick': {
      if (s.paused || s.active >= 0 || s.progress >= 100) return s
      if (s.stall > 0) return { ...s, stall: s.stall - 1 }
      const step = (100 / TOTAL_TICKS) * (s.fast ? 2 : 1)
      const progress = Math.min(100, s.progress + step)
      const upcoming = s.schedule[s.next]
      if (upcoming && progress >= upcoming.at) {
        return { ...s, progress: upcoming.at, active: s.next, ...withCue(s, 'surprised', `헉, ${upcoming.event.title}`) }
      }
      if (progress >= 100) {
        return {
          ...s,
          progress,
          ...addLog(s, { title: '준공 완료', choice: '준공결과를 확인할 수 있어요', effect: '✓', tone: 'good' }),
          ...(s.budget < 0 ? withCue(s, 'sad', '다 지었는데… 예산이 넘었어요.') : withCue(s, 'happy', '준공 완료! 해냈다!')),
        }
      }
      return { ...s, progress }
    }
    case 'choose': {
      if (s.active < 0) return s
      const { event } = s.schedule[s.active]
      const cost = a.choice.cost ?? 0
      const days = a.choice.days ?? 0
      return {
        ...s,
        budget: s.budget - cost,
        totalDays: s.totalDays + days,
        extraDays: s.extraDays + days,
        stats: Object.fromEntries(statNames.map((n) => [n, s.stats[n] + (a.choice.stats?.[n] ?? 0)])) as Record<StatName, number>,
        stall: Math.min(40, days * 5),
        active: -1,
        next: s.next + 1,
        ...addLog(s, {
          title: event.title.replace(/!$/, ''),
          choice: a.choice.label,
          effect: describeChoice(a.choice),
          tone: cost > 0 ? 'cost' : cost < 0 ? 'good' : 'neutral',
        }),
        ...withCue(s, ...reactionFor(a.choice, s.budget - cost)),
      }
    }
    case 'cueDone':
      return { ...s, cue: null }
    case 'togglePause':
      return s.progress >= 100 ? s : { ...s, paused: !s.paused }
    case 'fast':
      if (s.fast || s.progress >= 100 || s.budget < FAST_COST) return s
      return {
        ...s,
        fast: true,
        budget: s.budget - FAST_COST,
        ...addLog(s, { title: '빠른 시공', choice: '남은 공사 2배 속도', effect: `−${formatTenth(FAST_COST)}억`, tone: 'cost' }),
        ...withCue(s, 'happy', '속도 두 배! 가 보자고요!'),
      }
    case 'restart':
      return init()
  }
}

export function BuildPage() {
  const [s, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => {
    const id = window.setInterval(() => dispatch({ type: 'tick' }), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const done = s.progress >= 100
  const overBudget = s.budget < 0

  useEffect(() => {
    // 진행 중(또는 다시 시작)이면 지난 판 결과를 지우고, 준공되면 결과를 남깁니다.
    if (done) saveBuildResult({ id: s.runId, remaining: s.budget, stats: s.stats, extraDays: s.extraDays, fast: s.fast })
    else clearBuildResult()
  }, [done, s.runId, s.budget, s.stats, s.extraDays, s.fast])
  const [houseName] = useState(loadHouseName)
  const idx = Math.min(4, Math.floor(s.progress / 20))
  const within = done ? 100 : Math.round((s.progress - idx * 20) * 5)
  const days = done ? 0 : Math.ceil(s.totalDays * (1 - s.progress / 100) * (s.fast ? 0.5 : 1))
  const budgetLabel = `${formatTenth(s.budget)}억`
  const current = s.active >= 0 ? s.schedule[s.active] : null
  const liveText = s.stall > 0 ? '공사 대기 중' : s.paused ? '일시정지' : '공사 현장 실시간'
  const log: LogEntry[] = s.log.length ? s.log : [{ key: -1, title: '착공!', choice: '공사가 시작됐어요', effect: '', tone: 'neutral' }]

  return (
    <GameScreen
      photo="suburb"
      photoAlt="배경: 넓은 잔디 마당의 목재·유리 주택"
      shade="linear-gradient(180deg, rgba(43,42,39,0.40) 0%, rgba(43,42,39,0.15) 30%, rgba(43,42,39,0.45) 60%, rgba(43,42,39,0.90) 100%)"
      hud={
        <BudgetHud
          houseName={houseName}
          remaining={budgetLabel}
          fillPercent={overBudget ? 100 : s.budget / 10}
          fill={overBudget ? 'var(--stripe-danger)' : 'var(--stripe-progress)'}
        />
      }
      dialog={
        current && (
          <Dialog key={s.active} titleId="eventTitle" tone="yellow" stripe="hazard" maxWidth={540} tilt={-1.5} offsetTop={240}>
            <div className="event-dialog">
              <span className="event-dialog__count">
                {phaseNames[current.phase]} 공정 돌발 상황 {current.order}/{current.ofPhase}
              </span>
              <div className="event-dialog__head">
                <WarningIcon />
                <h2 id="eventTitle" className="event-dialog__title">
                  {current.event.title}
                </h2>
              </div>
              <p className="event-dialog__desc">
                {current.event.desc} 남은 예산 {budgetLabel}.
              </p>
              <div className="event-dialog__choices">
                {current.event.choices.map((c) => {
                  // 예산보다 비싸도 고를 수는 있지만, 고르면 예산 초과로 준공 실패가 됩니다.
                  const overBudget = (c.cost ?? 0) > 0 && (c.cost ?? 0) > s.budget
                  return (
                    <button
                      key={c.label}
                      type="button"
                      className={`event-choice${overBudget ? ' is-over' : ''}`}
                      onClick={() => dispatch({ type: 'choose', choice: c })}
                    >
                      <span className="event-choice__label">{c.label}</span>
                      <span className="event-choice__effect">
                        {describeChoice(c)}
                        {overBudget && <span className="event-choice__warn">예산 초과</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Dialog>
        )
      }
    >
      <div className="stage-head rise-1">
        <span className="tag" style={{ background: 'var(--coral)' }}>
          STAGE 4 · BUILD
        </span>
        <h1 className="stroke-title">공사 진행 중!</h1>
        <p className="caption">공사는 자동으로 진행돼요. 공정마다 돌발 상황이 2~3번씩 터져요. 잘 넘기면 준공!</p>
      </div>

      <section aria-label="공사 단계" className="build__phases glass rise-2">
        {phaseNames.map((name, i) => {
          const pct = s.progress >= (i + 1) * 20 ? 100 : i === idx ? within : 0
          const isCurrent = i === idx && !done
          return (
            <div key={name} className={`build__phase${isCurrent ? ' is-current' : ''}`}>
              <div className="build__phase-track">
                <div className="build__phase-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="build__phase-label">
                {pct === 100 ? '✓ ' : ''}
                {name}
                {isCurrent ? ' · 진행 중' : ''}
              </span>
            </div>
          )
        })}
      </section>

      <div className="build__layout">
        <section aria-label="공사 현장" className="build__site card rise-3">
          {/* 공사가 실제로 진행 중일 때만 움직입니다 (일시정지·대기·돌발 상황·준공 후에는 멈춤) */}
          <SiteFeed active={!done && !s.paused && s.stall === 0 && s.active < 0} />
          <div aria-hidden="true" className="build__site-shade" />
          <div aria-hidden="true" className="build__site-stripe" />
          <span className="build__live">
            <span className="build__live-dot" aria-hidden="true" />
            {liveText}
          </span>
          <div className="build__site-foot">
            <div className="build__task">
              <span>현재 작업</span>
              <strong>{done ? '준공 완료!' : s.stall > 0 ? '공사 일시 중단' : tasks[idx]}</strong>
            </div>
            <span className="build__badge">{done ? '준공 100%' : `${phaseNames[idx]} ${within}%`}</span>
          </div>
        </section>

        <aside className="build__side rise-3">
          <div className="build__timer">
            <div className="build__timer-info">
              <span className="build__timer-label">남은 공사 기간</span>
              <span className="build__timer-meta">
                속도 ×{s.fast ? 2 : 1} · 전체 {Math.floor(s.progress)}%
              </span>
              <span className="build__timer-meta">
                돌발 상황 {s.next}/{s.schedule.length}
              </span>
            </div>
            <strong className="build__days">D-{days}</strong>
          </div>

          <div className="build__controls">
            <button
              type="button"
              className="build__pause"
              aria-label={s.paused ? '공사 재개' : '공사 일시정지'}
              disabled={done}
              onClick={() => dispatch({ type: 'togglePause' })}
            >
              {s.paused || done ? (
                <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
                  <path d="M3 2 L20 12 L3 22 Z" fill="#2B2A27" />
                </svg>
              ) : (
                <PauseIcon />
              )}
            </button>
            {!s.fast && !done && s.budget >= FAST_COST ? (
              <button type="button" className="build__fast" onClick={() => dispatch({ type: 'fast' })}>
                <span className="build__fast-title">빠른 시공 ×2 »</span>
                <span className="build__fast-desc">{formatTenth(FAST_COST)}억 · 남은 공사 2배 속도, 기간 절반</span>
              </button>
            ) : (
              <div className="build__fast-note">
                {s.fast ? '빠른 시공 적용 중 · 속도 ×2' : done ? '공사가 끝났어요' : '예산이 부족해 빠른 시공 불가'}
              </div>
            )}
          </div>

          <section aria-label="이벤트 기록" className="build__log card">
            <strong className="build__log-title">이벤트 기록</strong>
            <ul>
              {log.map((l) => (
                <li key={l.key}>
                  <span>
                    <strong>{l.title}</strong>
                    <br />
                    <span className="build__log-choice">{l.choice}</span>
                  </span>
                  <strong className={`build__log-effect is-${l.tone}`}>{l.effect}</strong>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <StageBar level={4} current={3}>
        {done ? (
          <>
            <Link to="/result" className="btn btn--primary" style={{ fontSize: 22 }}>
              준공결과 확인 <DoubleChevron />
            </Link>
            <button type="button" className="build__restart" onClick={() => dispatch({ type: 'restart' })}>
              처음부터 다시 보기
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--sm btn--disabled-dark" disabled style={{ fontSize: 20 }}>
            준공결과 확인 · 준공 후
          </button>
        )}
      </StageBar>

      <CharacterCue cue={s.cue} onDone={() => dispatch({ type: 'cueDone' })} />
    </GameScreen>
  )
}
