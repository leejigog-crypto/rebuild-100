import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BoardLayout, BoardNotice } from '../components/BoardLayout'
import { HouseCard } from '../components/HouseCard'
import { DoubleChevron } from '../components/Icons'
import { ShareDialog } from '../components/ShareDialog'
import { toast } from '../lib/toast'
import { useHouses } from '../hooks/useHouses'
import { deleteHouse, listMyHouses, setHousePublic, type HouseRow } from '../lib/api'
import { isServerEnabled } from '../lib/supabase'

/** 내가 완공한 집 목록: 공개/비공개, 자랑하기, 삭제 */
export function MyHousesPage() {
  const { houses, setHouses, loading, liked, toggleLike } = useHouses(listMyHouses)
  const [sharing, setSharing] = useState<HouseRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const togglePublic = async (house: HouseRow) => {
    const next = !house.is_public
    setHouses((list) => list.map((h) => (h.id === house.id ? { ...h, is_public: next } : h)))
    const ok = await setHousePublic(house.id, next)
    if (!ok) {
      setHouses((list) => list.map((h) => (h.id === house.id ? { ...h, is_public: !next } : h)))
      toast('바꾸지 못했어요. 잠시 뒤 다시 해 주세요.', 'error')
      return
    }
    toast(next ? '갤러리에 공개했어요!' : '비공개로 바꿨어요.')
  }

  const remove = async (house: HouseRow) => {
    if (confirmDelete !== house.id) {
      setConfirmDelete(house.id)
      return
    }
    setConfirmDelete(null)
    const ok = await deleteHouse(house.id)
    if (!ok) {
      toast('삭제하지 못했어요.', 'error')
      return
    }
    setHouses((list) => list.filter((h) => h.id !== house.id))
    toast('집을 삭제했어요.')
  }

  return (
    <BoardLayout title="내 집" lead="지금까지 완공한 집이에요. 공개한 집은 갤러리와 랭킹에 올라가요.">
      {!isServerEnabled ? (
        <BoardNotice>서버 연결을 준비하고 있어요. 조금만 기다려 주세요!</BoardNotice>
      ) : loading ? (
        <BoardNotice>내 집을 불러오는 중…</BoardNotice>
      ) : houses.length === 0 ? (
        <BoardNotice
          action={
            <Link to="/intro" className="btn btn--primary">
              새 집 짓기 <DoubleChevron />
            </Link>
          }
        >
          아직 완공한 집이 없어요. 100억으로 첫 집을 지어 볼까요?
        </BoardNotice>
      ) : (
        <div className="board__grid">
          {houses.map((h) => (
            <HouseCard
              key={h.id}
              house={h}
              liked={liked.has(h.id)}
              onToggleLike={toggleLike}
              actions={
                <>
                  <button type="button" className={`tile-action${h.is_public ? ' is-on' : ''}`} aria-pressed={h.is_public} onClick={() => togglePublic(h)}>
                    {h.is_public ? '공개 중' : '비공개'}
                  </button>
                  {h.is_public && (
                    <button type="button" className="tile-action" onClick={() => setSharing(h)}>
                      자랑하기
                    </button>
                  )}
                  <button type="button" className="tile-action is-danger" onClick={() => remove(h)}>
                    {confirmDelete === h.id ? '정말 삭제?' : '삭제'}
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {sharing && (
        <ShareDialog
          houseId={sharing.id}
          houseName={sharing.house_name}
          grade={sharing.grade}
          total={sharing.total}
          title={sharing.title}
          photo={sharing.photo}
          onClose={() => setSharing(null)}
        />
      )}
    </BoardLayout>
  )
}
