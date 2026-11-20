import { useCallback, useEffect, useRef, useState } from 'react'
import type { Cue, Mood } from '../components/CharacterCue'

/**
 * Page-level character reactions. `show` makes the character slide in (replacing any
 * current one); `done` is passed to <CharacterCue onDone> to clear it after it leaves.
 * `showLater` schedules a cue and cancels it if the page unmounts first.
 */
export function useCharacterCue() {
  const [cue, setCue] = useState<Cue | null>(null)
  const nextId = useRef(0)
  const timers = useRef<number[]>([])

  const show = useCallback((mood: Mood, line: string) => {
    setCue({ id: nextId.current++, mood, line })
  }, [])

  const showLater = useCallback(
    (ms: number, mood: Mood, line: string) => {
      timers.current.push(window.setTimeout(() => show(mood, line), ms))
    },
    [show],
  )

  const done = useCallback(() => setCue(null), [])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  return { cue, show, showLater, done }
}
