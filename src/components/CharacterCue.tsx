import defaultImg from '../assets/character/default.png'
import happyImg from '../assets/character/happy.png'
import sadImg from '../assets/character/sad.png'
import surprisedImg from '../assets/character/surprised.png'
import './CharacterCue.css'

export type Mood = 'default' | 'happy' | 'surprised' | 'sad'

/** `id`가 바뀔 때마다 새로 등장합니다. */
export type Cue = { id: number; mood: Mood; line: string }

const portraits: Record<Mood, { src: string; alt: string }> = {
  default: { src: defaultImg, alt: '현장 소장 캐릭터, 차분한 표정' },
  happy: { src: happyImg, alt: '현장 소장 캐릭터, 기뻐하는 표정' },
  surprised: { src: surprisedImg, alt: '현장 소장 캐릭터, 깜짝 놀란 표정' },
  sad: { src: sadImg, alt: '현장 소장 캐릭터, 시무룩한 표정' },
}

/** Preload every expression so the first slide-in never shows an empty frame. */
for (const p of Object.values(portraits)) {
  const img = new Image()
  img.src = p.src
}

/**
 * 오른쪽에서 밀려 들어와 2초간 머문 뒤 다시 빠져나가는 캐릭터 카드.
 * 전체 길이 2.8초 = 등장 0.4초 + 머묾 2초 + 퇴장 0.4초 (CharacterCue.css).
 */
export function CharacterCue({ cue, onDone }: { cue: Cue | null; onDone: () => void }) {
  if (!cue) return null
  const p = portraits[cue.mood]
  return (
    <div
      key={cue.id}
      className={`character-cue is-${cue.mood}`}
      role="status"
      aria-live="polite"
      onAnimationEnd={(e) => {
        // ignore the portrait's own shake animation bubbling up
        if (e.target === e.currentTarget) onDone()
      }}
    >
      <p className="character-cue__bubble">{cue.line}</p>
      <img className="character-cue__portrait" src={p.src} alt={p.alt} width={407} height={517} />
    </div>
  )
}
