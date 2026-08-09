import { useMemo, useState } from 'react'
import { useStore } from '../lib/storeContext'
import { formatDate, formatINR } from '../lib/date'
import { Avatar, Stars } from './ui'
import FilterPanel from './FilterPanel'
import { DEFAULT_FILTERS, activeChips, applyFilters, type Filters } from '../lib/filters'

/**
 * Opens on the profiles the user has already saved, with the same text search and
 * facet filters as the home overlay for reaching everyone else.
 */
export default function ParticipantPicker({
  title = 'Add participants',
  selectedIds,
  conflictDates = [],
  onToggle,
  onClose,
}: {
  /** Names what is being staffed — the shoot, or one day of it. */
  title?: string
  selectedIds: string[]
  /**
   * The days being staffed. Anyone already booked on one of them is flagged, since
   * hiring for a single day is usually a search for whoever is free on that day.
   */
  conflictDates?: string[]
  onToggle: (id: string) => void
  onClose: () => void
}) {
  const { photographers, savedIds } = useStore()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, savedOnly: true })
  const [filterOpen, setFilterOpen] = useState(false)

  const q = query.trim().toLowerCase()
  const chips = activeChips(filters).filter((c) => c.id !== 'saved')

  const basePeople = useMemo(() => {
    if (!q) return photographers
    return photographers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.specialties.some((s) => s.toLowerCase().includes(q)),
    )
  }, [q, photographers])

  const results = useMemo(
    () => applyFilters(basePeople, filters, savedIds),
    [basePeople, filters, savedIds],
  )

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[88%] flex-col rounded-t-3xl border-t border-white/10 bg-slate-900 pb-5">
        <div className="shrink-0 px-5 pb-3 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <button type="button" onClick={onClose} className="text-xs font-semibold text-indigo-400">
              Done
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, city, skill"
                aria-label="Search photographers"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3.5 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label={chips.length ? `Filters, ${chips.length} applied` : 'Filters'}
              className={`relative shrink-0 rounded-xl border p-2.5 transition ${
                chips.length
                  ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="h-5 w-5">
                <path strokeLinecap="round" d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h10M18 17h2" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="10" cy="12" r="2" />
                <circle cx="16" cy="17" r="2" />
              </svg>
              {chips.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[9px] font-bold text-white">
                  {chips.length}
                </span>
              )}
            </button>
          </div>

          {/* Saved is the default scope; Everyone widens the search to all profiles. */}
          <div className="mt-2.5 flex gap-2">
            <ScopeTab
              active={filters.savedOnly}
              onClick={() => setFilters((f) => ({ ...f, savedOnly: true }))}
              label={`Saved (${savedIds.length})`}
            />
            <ScopeTab
              active={!filters.savedOnly}
              onClick={() => setFilters((f) => ({ ...f, savedOnly: false }))}
              label="Everyone"
            />
          </div>

          {chips.length > 0 && (
            <div className="mt-2.5 flex gap-1.5 overflow-x-auto">
              {chips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilters(c.clear)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-500 py-1.5 pl-3 pr-2 text-xs font-medium text-white"
                >
                  {c.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5">
          {results.map((p) => {
            const on = selectedIds.includes(p.id)
            const clashes = p.occupiedDates.filter((d) => conflictDates.includes(d))
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggle(p.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                  on ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Avatar name={p.name} gradient={p.gradient} image={p.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-white">
                    {p.name}
                    {savedIds.includes(p.id) && <span className="text-[10px] text-amber-400">★</span>}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">
                    {p.city} · {p.specialties.join(', ')}
                  </p>
                  {clashes.length > 0 && (
                    <p className="truncate text-[10px] font-medium text-amber-400">
                      Booked {clashes.length === 1 ? formatDate(clashes[0]) : `${clashes.length} of these days`}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <Stars rating={p.rating} className="text-[10px]" />
                  <p className="text-[10px] text-slate-500">{formatINR(p.dayRate)}/day</p>
                </div>
                {on && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4 shrink-0 text-indigo-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            )
          })}

          {results.length === 0 && (
            <p className="py-10 text-center text-xs text-slate-500">
              {filters.savedOnly
                ? 'Nothing saved matches. Try Everyone.'
                : 'No one matches that search.'}
            </p>
          )}
        </div>
      </div>

      {filterOpen && (
        <FilterPanel
          filters={filters}
          basePeople={basePeople}
          onApply={setFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  )
}

function ScopeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? 'bg-indigo-500 text-white' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )
}
