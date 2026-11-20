import { useCallback, useEffect, useState } from 'react'
import { toast } from '../lib/toast'
import { fetchMyLikes, setLike, type HouseRow } from '../lib/api'

/**
 * Loads a list of houses plus which ones this player liked.
 * Like toggles update the screen immediately and roll back if the server refuses.
 */
export function useHouses(load: () => Promise<HouseRow[]>) {
  const [houses, setHouses] = useState<HouseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState<Set<string>>(new Set())

  useEffect(() => {
    let alive = true
    setLoading(true)
    load().then(async (rows) => {
      const likes = await fetchMyLikes(rows.map((r) => r.id))
      if (!alive) return
      setHouses(rows)
      setLiked(likes)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [load])

  const toggleLike = useCallback(
    async (house: HouseRow) => {
      const next = !liked.has(house.id)
      const apply = (on: boolean) => {
        setLiked((set) => {
          const copy = new Set(set)
          if (on) copy.add(house.id)
          else copy.delete(house.id)
          return copy
        })
        setHouses((list) => list.map((h) => (h.id === house.id ? { ...h, likes_count: Math.max(0, h.likes_count + (on ? 1 : -1)) } : h)))
      }
      apply(next)
      const ok = await setLike(house.id, next)
      if (!ok) {
        apply(!next)
        toast('좋아요를 반영하지 못했어요.', 'error')
      }
    },
    [liked],
  )

  return { houses, setHouses, loading, liked, toggleLike }
}
