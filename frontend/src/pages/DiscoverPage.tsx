import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, MapPin, Wifi, ChevronDown } from 'lucide-react'
import { SessionCard, SessionCardSkeleton } from '../components/cards/SessionCard'
import { Layout } from '../components/layout/Layout'
import { useSearchParams } from 'react-router-dom'
import { sessionsApi } from '../lib/services'
import { mapApiSession, mapApiCategory } from '../lib/mappers'
import type { Session, Category } from '../types'
import clsx from 'clsx'

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const FORMATS = ['All', 'Remote', 'Local']
const PRICES = ['All', 'Under $20', '$20–$35', '$35+']
const DURATIONS = ['All', '30 min', '45 min']
const SORT_OPTIONS = ['Most popular', 'Highest rated', 'Lowest price', 'Newest']

export function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('All')
  const [format, setFormat] = useState('All')
  const [priceRange, setPriceRange] = useState('All')
  const [sort, setSort] = useState('Most popular')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)

  const activeCategory = searchParams.get('category') || 'all'

  // Load categories once
  useEffect(() => {
    sessionsApi.categories().then(res => {
      setCategories(res.data.map(mapApiCategory))
    }).catch(() => {})
  }, [])

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const sortMap: Record<string, 'POPULAR' | 'RATING' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST'> = {
        'Most popular': 'POPULAR',
        'Highest rated': 'RATING',
        'Lowest price': 'PRICE_ASC',
        'Newest': 'NEWEST',
      }
      const levelMap: Record<string, string> = {
        'Beginner': 'BEGINNER',
        'Intermediate': 'INTERMEDIATE',
        'Advanced': 'ADVANCED',
      }
      const priceMap: Record<string, { minPrice?: number; maxPrice?: number }> = {
        'Under $20': { maxPrice: 20 },
        '$20–$35': { minPrice: 20, maxPrice: 35 },
        '$35+': { minPrice: 35 },
      }

      const res = await sessionsApi.list({
        q: query || undefined,
        category: activeCategory !== 'all' ? activeCategory : undefined,
        level: level !== 'All' ? levelMap[level] : undefined,
        format: format === 'Remote' ? 'REMOTE' : format === 'Local' ? 'LOCAL' : 'ALL',
        sort: sortMap[sort] ?? 'POPULAR',
        limit: 24,
        ...(priceRange !== 'All' ? priceMap[priceRange] : {}),
      })
      setSessions(res.data.map(mapApiSession))
      setTotal(res.meta.total)
    } catch {
      setSessions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [query, activeCategory, level, format, priceRange, sort])

  useEffect(() => {
    const timer = setTimeout(fetchSessions, query ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchSessions, query])

  const filtered = sessions
  const activeFiltersCount = [level !== 'All', format !== 'All', priceRange !== 'All'].filter(Boolean).length

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)] mb-1">
            Discover sessions
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {loading ? 'Searching…' : `${total} session${total !== 1 ? 's' : ''} available`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              className="input pl-10 pr-4"
              placeholder="Search by skill, topic, or guide..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                onClick={() => setQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            className={clsx('btn-outline flex items-center gap-2 flex-shrink-0', activeFiltersCount > 0 && 'border-brand-400 text-brand-600')}
            onClick={() => setShowFilters(o => !o)}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              className="input pr-10 appearance-none cursor-pointer min-w-[160px]"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        {showFilters && (
          <div className="card p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FilterGroup label="Level" options={LEVELS} value={level} onChange={setLevel} />
            <FilterGroup label="Format" options={FORMATS} value={format} onChange={setFormat}
              renderOption={(opt) => (
                <span className="flex items-center gap-1">
                  {opt === 'Remote' && <Wifi size={12} />}
                  {opt === 'Local' && <MapPin size={12} />}
                  {opt}
                </span>
              )}
            />
            <FilterGroup label="Price" options={PRICES} value={priceRange} onChange={setPriceRange} />
            <FilterGroup label="Duration" options={DURATIONS} value={priceRange} onChange={setPriceRange} />
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-1">
          <button
            onClick={() => setSearchParams({})}
            className={clsx(
              'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all',
              activeCategory === 'all'
                ? 'bg-brand-500 text-white shadow-brand'
                : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            All skills
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.id })}
              className={clsx(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all',
                activeCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SessionCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState query={query} onClear={() => { setQuery(''); setSearchParams({}) }} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        )}
      </div>
    </Layout>
  )
}

function FilterGroup({
  label, options, value, onChange, renderOption,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  renderOption?: (opt: string) => React.ReactNode
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all',
              value === opt
                ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-900'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
            )}
          >
            {renderOption ? renderOption(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">
        No sessions found
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-xs mx-auto">
        {query ? `No results for "${query}". Try different keywords or clear filters.` : 'No sessions match your filters. Try adjusting them.'}
      </p>
      <button className="btn-primary" onClick={onClear}>Clear search</button>
    </div>
  )
}
