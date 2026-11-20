import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * UI-only dialog switch driven by the URL (`?dialog=edit`).
 * Lets every designed dialog state be opened and reviewed before game logic exists.
 */
export function usePreviewDialog<T extends string>() {
  const [params, setParams] = useSearchParams()
  const current = (params.get('dialog') as T | null) ?? null

  const open = useCallback(
    (name: T) => {
      const next = new URLSearchParams(params)
      next.set('dialog', name)
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  const close = useCallback(() => {
    const next = new URLSearchParams(params)
    next.delete('dialog')
    setParams(next, { replace: true })
  }, [params, setParams])

  return { current, open, close }
}
