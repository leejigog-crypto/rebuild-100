import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BoardLayout, BoardNotice } from '../components/BoardLayout'
import { HouseCard } from '../components/HouseCard'
import { DoubleChevron } from '../components/Icons'
import { useHouses } from '../hooks/useHouses'
import { listPublicHouses } from '../lib/api'
import { isServerEnabled } from '../lib/supabase'

/** 갤러리(좋아요순) / 랭킹(점수순) */
export function GalleryPage() {
  const [params] = useSearchParams()
  const tab = params.get('tab') === 'rank' ? 'rank' : 'popular'
  const load = useCallback(() => listPublicHouses(tab === 'rank' ? 'total' : 'likes', tab === 'rank' ? 30 : 24), [tab])
  const { houses, loading, liked, toggleLike } = useHouses(load)

  return (
    <BoardLayout
      title={tab === 'rank' ? '명예의 전당' : '지금 인기 있는 집'}
      lead={tab === 'rank' ? '종합 점수가 높은 집 순서예요.' : '다른 사람들은 100억으로 어떤 집을 지었을까요?'}
      aside={
        <nav className="board-tabs" aria-label="보기">
          <Link to="/gallery" aria-current={tab === 'popular' ? 'page' : undefined}>
            인기
          </Link>
          <Link to="/gallery?tab=rank" aria-current={tab === 'rank' ? 'page' : undefined}>
            랭킹
          </Link>
        </nav>
      }
    >
      {!isServerEnabled ? (
        <BoardNotice>서버 연결을 준비하고 있어요. 조금만 기다려 주세요!</BoardNotice>
      ) : loading ? (
        <BoardNotice>집들을 불러오는 중…</BoardNotice>
      ) : houses.length === 0 ? (
        <BoardNotice
          action={
            <Link to="/intro" className="btn btn--primary">
              첫 번째 집 짓기 <DoubleChevron />
            </Link>
          }
        >
          아직 공개된 집이 없어요. 첫 번째 주인공이 되어 보세요!
        </BoardNotice>
      ) : (
        <div className="board__grid">
          {houses.map((h, i) => (
            <HouseCard
              key={h.id}
              house={h}
              rank={tab === 'rank' ? i + 1 : undefined}
              liked={liked.has(h.id)}
              onToggleLike={toggleLike}
            />
          ))}
        </div>
      )}
    </BoardLayout>
  )
}
