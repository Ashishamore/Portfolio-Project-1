import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Photographer } from '../lib/types'
import { useStore } from '../lib/storeContext'
import { ALL_CITIES, ALL_SPECIALTIES } from '../lib/mockData'
import { TOP_CITIES, cityIcon, nearestCity } from '../lib/cities'
import {
  ALL_EQUIPMENT,
  DEFAULT_FILTERS,
  HIRE_STEPS,
  PROFICIENCY_LEVELS,
  RATE_BRACKETS,
  RATE_MAX,
  RATE_MIN,
  RATING_STEPS,
  SORT_OPTIONS,
  applyFilters,
  type Filters,
} from '../lib/filters'

export default function FilterPanel({
  filters,
  basePeople,
  onApply,
  onClose,
}: {
  filters: Filters
  /** Already narrowed by the text query, so the count matches what you'll see. */
  basePeople: Photographer[]
  onApply: (f: Filters) => void
  onClose: () => void
}) {
  const { savedIds } = useStore()
  const [draft, setDraft] = useState<Filters>(filters)
  const [cityQuery, setCityQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationNote, setLocationNote] = useState('')

  const count = applyFilters(basePeople, draft, savedIds).length

  const q = cityQuery.trim().toLowerCase()
  const cityMatches = q ? ALL_CITIES.filter((c) => c.toLowerCase().includes(q)) : ALL_CITIES

  /** Resolves the device position to the nearest city that has photographers. */
  function locate() {
    if (!navigator.geolocation) {
      setLocationNote('Location is not available in this browser.')
      return
    }

    setLocating(true)
    setLocationNote('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { city, km } = nearestCity(pos.coords.latitude, pos.coords.longitude)
        setDraft((d) => ({
          ...d,
          cities: d.cities.includes(city.name) ? d.cities : [...d.cities, city.name],
        }))
        setLocationNote(`Nearest city with photographers: ${city.name} (~${Math.round(km)} km)`)
        setLocating(false)
      },
      (err) => {
        setLocationNote(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — pick a city instead.'
            : 'Could not get your location — pick a city instead.',
        )
        setLocating(false)
      },
      { timeout: 10000 },
    )
  }

  function toggleIn<K extends 'cities' | 'specialties' | 'proficiencies' | 'equipment'>(
    key: K,
    value: Filters[K][number],
  ) {
    setDraft((d) => {
      const list = d[key] as string[]
      const next = list.includes(value as string)
        ? list.filter((x) => x !== value)
        : [...list, value as string]
      return { ...d, [key]: next } as Filters
    })
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[92%] flex-col rounded-t-3xl border-t border-white/10 bg-slate-900">
        <div className="shrink-0 px-5 pb-3 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Filters</h2>
            <button
              type="button"
              onClick={() => setDraft(DEFAULT_FILTERS)}
              className="text-xs font-semibold text-indigo-400"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <Group title="Sort by">
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((o) => (
                <Pill
                  key={o.key}
                  active={draft.sortBy === o.key}
                  onClick={() => setDraft((d) => ({ ...d, sortBy: o.key }))}
                >
                  {o.label}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="Location">
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-indigo-400">
                <circle cx="12" cy="12" r="3.5" />
                <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-white">
                  {locating ? 'Finding you…' : 'Use my current location'}
                </span>
                {locationNote && <span className="block text-[10px] text-slate-400">{locationNote}</span>}
              </span>
            </button>

            <div className="relative mt-2.5">
              <input
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Search any city"
                aria-label="Search a city"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3.5 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
              />
              {cityQuery && (
                <button
                  type="button"
                  onClick={() => setCityQuery('')}
                  aria-label="Clear city search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Ready-made suggestions until the user starts typing a place of their own. */}
            {!cityQuery && (
              <>
                <p className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Top cities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TOP_CITIES.map((c) => (
                    <Pill
                      key={c.name}
                      active={draft.cities.includes(c.name)}
                      onClick={() => toggleIn('cities', c.name)}
                    >
                      <span className="mr-1">{c.icon}</span>
                      {c.name}
                    </Pill>
                  ))}
                </div>
              </>
            )}

            <p className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {cityQuery ? 'Matches' : 'All cities'}
            </p>
            <div className="grid grid-cols-2 gap-x-3">
              {cityMatches.map((c) => (
                <CheckRow
                  key={c}
                  label={c}
                  icon={cityIcon(c)}
                  checked={draft.cities.includes(c)}
                  onChange={() => toggleIn('cities', c)}
                />
              ))}
            </div>

            {cityMatches.length === 0 && (
              <p className="text-[11px] text-slate-500">
                No photographers listed in “{cityQuery}” yet.
              </p>
            )}
          </Group>

          <Group title="Day rate">
            <div className="flex flex-wrap gap-1.5">
              {RATE_BRACKETS.map((b) => (
                <Pill
                  key={b.label}
                  active={draft.minRate === b.min && draft.maxRate === b.max}
                  onClick={() =>
                    setDraft((d) =>
                      d.minRate === b.min && d.maxRate === b.max
                        ? { ...d, minRate: RATE_MIN, maxRate: RATE_MAX }
                        : { ...d, minRate: b.min, maxRate: b.max },
                    )
                  }
                >
                  {b.label}
                </Pill>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <NumberBox
                label="Min"
                value={draft.minRate}
                onChange={(v) => setDraft((d) => ({ ...d, minRate: v }))}
              />
              <span className="mt-4 text-slate-600">—</span>
              <NumberBox
                label="Max"
                value={draft.maxRate}
                onChange={(v) => setDraft((d) => ({ ...d, maxRate: v }))}
              />
            </div>
          </Group>

          <Group title="Type of photographer">
            <div className="grid grid-cols-2 gap-x-3">
              {ALL_SPECIALTIES.map((s) => (
                <CheckRow
                  key={s}
                  label={s}
                  checked={draft.specialties.includes(s)}
                  onChange={() => toggleIn('specialties', s)}
                />
              ))}
            </div>
          </Group>

          <Group title="Proficiency level">
            <div className="grid grid-cols-2 gap-x-3">
              {PROFICIENCY_LEVELS.map((p) => (
                <CheckRow
                  key={p}
                  label={p}
                  checked={draft.proficiencies.includes(p)}
                  onChange={() => toggleIn('proficiencies', p)}
                />
              ))}
            </div>
          </Group>

          <Group title="Equipment">
            <div className="grid grid-cols-2 gap-x-3">
              {ALL_EQUIPMENT.map((e) => (
                <CheckRow
                  key={e}
                  label={e}
                  checked={draft.equipment.includes(e)}
                  onChange={() => toggleIn('equipment', e)}
                />
              ))}
            </div>
          </Group>

          <Group title="Rating">
            <div className="flex flex-wrap gap-1.5">
              {RATING_STEPS.map((r) => (
                <Pill
                  key={r}
                  active={draft.minRating === r}
                  onClick={() => setDraft((d) => ({ ...d, minRating: d.minRating === r ? 0 : r }))}
                >
                  {r.toFixed(1)}★ & up
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="Experience">
            <div className="flex flex-wrap gap-1.5">
              {HIRE_STEPS.map((h) => (
                <Pill
                  key={h}
                  active={draft.minHires === h}
                  onClick={() => setDraft((d) => ({ ...d, minHires: d.minHires === h ? 0 : h }))}
                >
                  {h}+ hires
                </Pill>
              ))}
            </div>
          </Group>

          <Group title="Available between">
            <div className="grid grid-cols-2 gap-3">
              <DateBox
                label="From"
                value={draft.availableFrom}
                onChange={(v) => setDraft((d) => ({ ...d, availableFrom: v }))}
              />
              <DateBox
                label="To"
                value={draft.availableTo}
                onChange={(v) => setDraft((d) => ({ ...d, availableTo: v }))}
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              Shows only photographers with no bookings across the whole window.
            </p>
          </Group>

          <Group title="Other">
            <CheckRow
              label="Saved profiles only"
              checked={draft.savedOnly}
              onChange={() => setDraft((d) => ({ ...d, savedOnly: !d.savedOnly }))}
            />
          </Group>
        </div>

        <div className="shrink-0 border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              onApply(draft)
              onClose()
            }}
            className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Show {count} {count === 1 ? 'result' : 'results'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-white/5 py-4 last:border-b-0">
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  )
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-indigo-500 text-white'
          : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function CheckRow({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string
  checked: boolean
  onChange: () => void
  icon?: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2.5 py-1.5 text-left"
      aria-pressed={checked}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
          checked ? 'border-indigo-500 bg-indigo-500' : 'border-white/25 bg-transparent'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3.5} className="h-2.5 w-2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        )}
      </span>
      {icon && <span className="shrink-0 text-xs leading-none">{icon}</span>}
      <span className={`truncate text-xs ${checked ? 'text-white' : 'text-slate-300'}`}>{label}</span>
    </button>
  )
}

function NumberBox({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex-1">
      <span className="mb-1 block text-[10px] text-slate-500">{label}</span>
      <input
        type="number"
        value={value}
        min={RATE_MIN}
        max={RATE_MAX}
        step={500}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(n)
        }}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white focus:border-indigo-500/50 focus:outline-none"
      />
    </label>
  )
}

function DateBox({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] text-slate-500">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white [color-scheme:dark] focus:border-indigo-500/50 focus:outline-none"
      />
    </label>
  )
}
