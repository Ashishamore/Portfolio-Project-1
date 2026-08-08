import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import type { Photographer } from '../lib/types'
import { ALL_CITIES, ALL_SPECIALTIES } from '../lib/mockData'
import { formatDate, formatINR } from '../lib/date'
import { Avatar, Chip, PinIcon, Stars } from './ui'
import FilterPanel from './FilterPanel'
import {
  DEFAULT_FILTERS,
  activeChips,
  applyFilters,
  type Filters,
} from '../lib/filters'

export default function SearchOverlay() {
  const navigate = useNavigate()
  const { photographers, assignments, closeSearch, getPhotographer, savedIds } = useStore()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focusing the field is what raises the on-screen keyboard on a real device.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeSearch])

  const q = query.trim().toLowerCase()
  const chips = activeChips(filters)

  /** Text-matched people, before facets — also what the panel counts against. */
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

  const results = useMemo(() => {
    const people = applyFilters(basePeople, filters, savedIds)

    // Only text search reaches beyond people — facets are person filters.
    if (!q) return { people, jobs: [], places: [], skills: [] }

    return {
      people,
      jobs: assignments.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q),
      ),
      places: ALL_CITIES.filter((c) => c.toLowerCase().includes(q)),
      skills: ALL_SPECIALTIES.filter((s) => s.toLowerCase().includes(q)),
    }
  }, [q, basePeople, filters, savedIds, assignments])

  const total = results.people.length + results.jobs.length + results.places.length + results.skills.length

  function goToPhotographer(id: string) {
    closeSearch()
    navigate(`/photographer/${id}`)
  }

  return (
    // Sits below the status bar (z-40 vs its z-50) and is inset by its height.
    <div className="animate-overlay absolute inset-x-0 bottom-0 top-9 z-40 flex flex-col bg-slate-950">
      <div className="animate-search-rise flex shrink-0 items-center gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={closeSearch}
          aria-label="Close search"
          className="-m-1 shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" />
          </svg>
        </button>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, assignments, places"
            enterKeyHint="search"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3.5 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
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

      {/* Applied filters, horizontally scrollable when the row overflows. */}
      {chips.length > 0 && (
        <div className="shrink-0 border-b border-white/10 pb-2.5">
          <div className="flex gap-1.5 overflow-x-auto px-4">
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
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="shrink-0 whitespace-nowrap px-2 text-xs font-semibold text-indigo-400"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className="animate-content-rise min-h-0 flex-1 overflow-y-auto">
        {!q && (
          <Group title={`${results.people.length} ${results.people.length === 1 ? 'photographer' : 'photographers'}`}>
            {results.people.map((p) => (
              <PersonRow key={p.id} photographer={p} onSelect={() => goToPhotographer(p.id)} />
            ))}
            {results.people.length === 0 && (
              <p className="py-10 text-center text-xs text-slate-500">No one matches those filters.</p>
            )}
          </Group>
        )}

        {q && total === 0 && (
          <div className="px-8 py-16 text-center">
            <p className="text-sm text-slate-400">No results for “{query}”</p>
            <p className="mt-1 text-xs text-slate-600">Try a city, a skill, or a photographer's name.</p>
          </div>
        )}

        {q && total > 0 && (
          <div className="pb-6">
            {results.people.length > 0 && (
              <Group title={`People (${results.people.length})`}>
                {results.people.map((p) => (
                  <PersonRow key={p.id} photographer={p} onSelect={() => goToPhotographer(p.id)} />
                ))}
              </Group>
            )}

            {results.jobs.length > 0 && (
              <Group title={`Assignments (${results.jobs.length})`}>
                {results.jobs.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      closeSearch()
                      navigate('/schedule')
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
                  >
                    <p className="truncate text-xs font-semibold text-white">{a.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <PinIcon className="h-3 w-3" />
                      {a.location} · {formatDate(a.startDate)} · {a.durationDays}d
                    </p>
                    {a.participantIds.length > 0 && (
                      <div className="mt-2 flex -space-x-1.5">
                        {a.participantIds.map((id) => {
                          const p = getPhotographer(id)
                          if (!p) return null
                          return (
                            <div key={id} className="rounded-full ring-2 ring-slate-950">
                              <Avatar name={p.name} gradient={p.gradient} image={p.avatar} size="sm" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </button>
                ))}
              </Group>
            )}

            {results.places.length > 0 && (
              <Group title="Places">
                <div className="flex flex-wrap gap-1.5">
                  {results.places.map((c) => (
                    <Chip key={c} onClick={() => setQuery(c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
              </Group>
            )}

            {results.skills.length > 0 && (
              <Group title="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {results.skills.map((s) => (
                    <Chip key={s} onClick={() => setQuery(s)}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </Group>
            )}
          </div>
        )}
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

function PersonRow({
  photographer: p,
  onSelect,
}: {
  photographer: Photographer
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 text-left transition hover:bg-white/10"
    >
      <Avatar name={p.name} gradient={p.gradient} image={p.avatar} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{p.name}</p>
        <p className="truncate text-[10px] text-slate-500">
          {p.city} · {p.specialties.join(', ')}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <Stars rating={p.rating} className="text-[10px]" />
        <p className="text-[10px] text-slate-500">{formatINR(p.dayRate)}/day</p>
      </div>
    </button>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 pt-5">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
