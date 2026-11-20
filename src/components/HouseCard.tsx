import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { housePhotoUrl } from '../data/houses'
import type { HouseRow } from '../lib/api'
import './HouseCard.css'

type Props = {
  house: HouseRow
  /** 랭킹 순위 (1부터) */
  rank?: number
  liked?: boolean
  onToggleLike?: (house: HouseRow) => void
  /** 카드 아래 추가 행동 (내 집 화면의 공개·공유 버튼 등) */
  actions?: ReactNode
}

export function HouseCard({ house, rank, liked = false, onToggleLike, actions }: Props) {
  return (
    <article className="house-tile">
      <Link to={`/h/${house.id}`} className="house-tile__link">
        <div
          role="img"
          aria-label={`${house.house_name} 사진`}
          className="house-tile__photo photo"
          style={{ backgroundImage: `url(${housePhotoUrl(house.photo)})` }}
        >
          {rank !== undefined && <span className="house-tile__rank">{rank}위</span>}
        </div>
        <div className="house-tile__body">
          <div className="house-tile__top">
            <strong className="house-tile__name">{house.house_name}</strong>
            <span className="house-tile__grade" aria-label={`${house.grade}등급`}>
              {house.grade}
            </span>
          </div>
          <span className="house-tile__meta">
            {house.site_name.split(' ')[0]} · {house.player_name || '익명'} · {house.total}점
          </span>
        </div>
      </Link>
      <div className="house-tile__foot">
        {onToggleLike && house.is_public ? (
          <LikeButton liked={liked} count={house.likes_count} onClick={() => onToggleLike(house)} />
        ) : (
          <span className="house-tile__likes">좋아요 {house.likes_count.toLocaleString()}</span>
        )}
        {actions}
      </div>
    </article>
  )
}

export function LikeButton({ liked, count, onClick, big = false }: { liked: boolean; count: number; onClick: () => void; big?: boolean }) {
  return (
    <button
      type="button"
      className={`like-btn${liked ? ' is-liked' : ''}${big ? ' like-btn--big' : ''}`}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      onClick={onClick}
    >
      <svg width="20" height="18" viewBox="0 0 24 22" aria-hidden="true">
        <path
          d="M12 20.5 L3.2 11.8 A5.4 5.4 0 0 1 12 4.6 A5.4 5.4 0 0 1 20.8 11.8 Z"
          fill={liked ? '#FF4B3E' : '#FFFFFF'}
          stroke="#2B2A27"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
      </svg>
      <span>{count.toLocaleString()}</span>
    </button>
  )
}
