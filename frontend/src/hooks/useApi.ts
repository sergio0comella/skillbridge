import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiError } from '../lib/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  fetcher: () => Promise<{ data: T }>,
  deps: unknown[] = [],
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetcher()
      if (mountedRef.current) {
        setState({ data: res.data, loading: false, error: null })
      }
    } catch (err) {
      if (mountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof ApiError ? err.message : 'Something went wrong',
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { ...state, refetch: fetch }
}

export function usePaginatedApi<T>(
  fetcher: (page: number) => Promise<{ data: T[]; meta: { page: number; totalPages: number; total: number } }>,
  deps: unknown[] = [],
) {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<T[]>([])
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher(p)
      setItems(p === 1 ? res.data : prev => [...prev, ...res.data])
      setMeta(res.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    setPage(1)
    setItems([])
    fetch(1)
  }, [fetch])

  const loadMore = () => {
    if (meta && page < meta.totalPages) {
      const next = page + 1
      setPage(next)
      fetch(next)
    }
  }

  return {
    items,
    meta,
    loading,
    error,
    loadMore,
    hasMore: meta ? page < meta.totalPages : false,
  }
}
