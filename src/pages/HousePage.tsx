import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BoardLayout, BoardNotice } from '../components/BoardLayout'
import { LikeButton } from '../components/HouseCard'
import { DoubleChevron } from '../components/Icons'
import { ShareDialog } from '../components/ShareDialog'
import { toast } from '../lib/toast'
import { housePhotoUrl } from '../data/houses'
import { fetchMyLikes, getHouse, setLike, type HouseRow } from '../lib/api'
import { getExistingUser, isServerEnabled } from '../lib/supabase'
import './HousePage.css'

/** 공유 링크로 들어오는 집 한 채 화면 (/h/:id) */
export function HousePage() {
  const { id = '' } = useParams()
  const [house, setHouse] = useState<HouseRow | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [liked, setLiked] = useState(false)
  const [mine, setMine] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const row = await getHouse(id)
      if (!alive) return
      if (!row) {
        setState('missing')
        return
      }
      const [likes, me] = await Promise.all([fetchMyLikes([row.id]), getExistingUser()])
      if (!alive) return
      setHouse(row)
      setLiked(likes.has(row.id))
      setMine(me === row.user_id)
      setState('ready')
      document.title = `100억 리빌드 · ${row.house_name}`
    })()
    return () => {
      alive = false
    }
  }, [id])

  const toggleLike = async () => {
    if (!house) return
    const next = !liked
    setLiked(next)
    setHouse({ ...house, likes_count: Math.max(0, house.likes_count + (next ? 1 : -1)) })
    if (!(await setLike(house.id, next))) {
      setLiked(!next)
      setHouse(house)
      toast('좋아요를 반영하지 못했어요.', 'error')
    }
  }

  if (!isServerEnabled || state !== 'ready' || !house) {
    return (
      <BoardLayout title="집 구경">
        <BoardNotice
          action={
            state === 'missing' && (
              <Link to="/gallery" className="btn btn--primary">
                갤러리 둘러보기 <DoubleChevron />
              </Link>
            )
          }
        >
          {!isServerEnabled
            ? '서버 연결을 준비하고 있어요.'
            : state === 'loading'
              ? '집을 불러오는 중…'
              : '이 집을 찾을 수 없어요. 비공개로 바뀌었거나 삭제됐을 수 있어요.'}
        </BoardNotice>
      </BoardLayout>
    )
  }

  return (
    <BoardLayout title={house.house_name} lead={`${house.player_name || '익명'} 님이 100억으로 지은 집 · ${house.site_name} · ${house.look_name}`}>
      <div className="house-view">
        <section aria-label="집 사진" className="house-view__photo-card">
          <div
            role="img"
            aria-label={`${house.house_name} 사진`}
            className="house-view__photo photo"
            style={{ backgroundImage: `url(${housePhotoUrl(house.photo)})` }}
          >
            {mine && <span className="house-view__mine">내 집{house.is_public ? '' : ' · 비공개'}</span>}
          </div>
        </section>

        <aside className="house-view__side">
          <div className="house-view__grade-row glass">
            <div className="house-view__grade" aria-label={`종합 등급 ${house.grade}`}>
              {house.grade}
            </div>
            <div className="house-view__grade-info">
              <strong className="house-view__total">
                {house.total}
                <span> /100</span>
              </strong>
              <span className="house-view__title">칭호 · {house.title}</span>
            </div>
          </div>

          <div className="house-view__scores card">
            {house.scores.map((s) => (
              <div key={s.label} className="score-row">
                <span className="score-row__label">{s.label}</span>
                <div role="img" aria-label={`${s.label} ${s.value}점`} className="score-row__track">
                  <div className="score-row__fill" style={{ width: `${s.value}%`, background: s.value >= 90 ? 'var(--orange)' : 'var(--sky)' }} />
                </div>
                <strong className="score-row__value">{s.value}</strong>
              </div>
            ))}
          </div>

          <div className="house-view__actions">
            {house.is_public && <LikeButton big liked={liked} count={house.likes_count} onClick={toggleLike} />}
            {house.is_public && (
              <button type="button" className="btn btn--accent" onClick={() => setSharing(true)}>
                자랑하기
              </button>
            )}
            <Link to="/intro" className="btn btn--primary">
              나도 지어 보기 <DoubleChevron />
            </Link>
          </div>
        </aside>
      </div>

      {sharing && (
        <ShareDialog
          houseId={house.id}
          houseName={house.house_name}
          grade={house.grade}
          total={house.total}
          title={house.title}
          photo={house.photo}
          onClose={() => setSharing(false)}
        />
      )}
    </BoardLayout>
  )
}
