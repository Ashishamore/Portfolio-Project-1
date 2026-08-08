import type { Photographer, Proficiency } from './types'
import { photographers } from './mockData'
import { formatDate, formatINR } from './date'
import { cityIcon } from './cities'

export const PROFICIENCY_LEVELS: Proficiency[] = ['Emerging', 'Intermediate', 'Advanced', 'Expert']

export const ALL_EQUIPMENT = Array.from(
  new Set(photographers.flatMap((p) => p.equipment.map((g) => g.category))),
).sort()

export const RATE_MIN = Math.min(...photographers.map((p) => p.dayRate))
export const RATE_MAX = Math.max(...photographers.map((p) => p.dayRate))

export type SortKey = 'relevance' | 'rating' | 'rateAsc' | 'rateDesc' | 'hires'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'rating', label: 'Highest rated' },
  { key: 'rateAsc', label: 'Rate: low to high' },
  { key: 'rateDesc', label: 'Rate: high to low' },
  { key: 'hires', label: 'Most hired' },
]

export const RATE_BRACKETS: { label: string; min: number; max: number }[] = [
  { label: 'Under ₹10k', min: RATE_MIN, max: 10000 },
  { label: '₹10k – ₹15k', min: 10000, max: 15000 },
  { label: '₹15k – ₹20k', min: 15000, max: 20000 },
  { label: '₹20k+', min: 20000, max: RATE_MAX },
]

export const RATING_STEPS = [4.8, 4.5, 4.0]
export const HIRE_STEPS = [10, 25, 50]

export type Filters = {
  cities: string[]
  specialties: string[]
  proficiencies: Proficiency[]
  equipment: string[]
  minRate: number
  maxRate: number
  minRating: number
  minHires: number
  availableFrom: string
  availableTo: string
  savedOnly: boolean
  sortBy: SortKey
}

export const DEFAULT_FILTERS: Filters = {
  cities: [],
  specialties: [],
  proficiencies: [],
  equipment: [],
  minRate: RATE_MIN,
  maxRate: RATE_MAX,
  minRating: 0,
  minHires: 0,
  availableFrom: '',
  availableTo: '',
  savedOnly: false,
  sortBy: 'relevance',
}

/** Free across the whole requested window — a single booked day disqualifies. */
function isAvailable(p: Photographer, from: string, to: string): boolean {
  if (!from && !to) return true
  const start = from || to
  const end = to || from
  if (end < start) return true // incomplete/inverted range: ignore rather than hide everyone
  return !p.occupiedDates.some((d) => d >= start && d <= end)
}

export function applyFilters(
  list: Photographer[],
  f: Filters,
  savedIds: string[],
): Photographer[] {
  const matched = list.filter((p) => {
    if (f.cities.length && !f.cities.includes(p.city)) return false
    if (f.specialties.length && !f.specialties.some((s) => p.specialties.includes(s))) return false
    if (f.proficiencies.length && !f.proficiencies.includes(p.proficiency)) return false
    if (f.equipment.length && !f.equipment.some((c) => p.equipment.some((g) => g.category === c)))
      return false
    if (p.dayRate < f.minRate || p.dayRate > f.maxRate) return false
    if (p.rating < f.minRating) return false
    if (p.timesHired < f.minHires) return false
    if (f.savedOnly && !savedIds.includes(p.id)) return false
    if (!isAvailable(p, f.availableFrom, f.availableTo)) return false
    return true
  })

  switch (f.sortBy) {
    case 'rating':
      return [...matched].sort((a, b) => b.rating - a.rating)
    case 'rateAsc':
      return [...matched].sort((a, b) => a.dayRate - b.dayRate)
    case 'rateDesc':
      return [...matched].sort((a, b) => b.dayRate - a.dayRate)
    case 'hires':
      return [...matched].sort((a, b) => b.timesHired - a.timesHired)
    default:
      return matched
  }
}

export type ActiveChip = {
  id: string
  label: string
  clear: (f: Filters) => Filters
}

function without<T>(list: T[], value: T): T[] {
  return list.filter((x) => x !== value)
}

/** Every applied filter as an individually removable chip. */
export function activeChips(f: Filters): ActiveChip[] {
  const chips: ActiveChip[] = []

  if (f.savedOnly) {
    chips.push({ id: 'saved', label: '★ Saved', clear: (x) => ({ ...x, savedOnly: false }) })
  }

  for (const c of f.cities) {
    chips.push({
      id: `city:${c}`,
      label: `${cityIcon(c)} ${c}`,
      clear: (x) => ({ ...x, cities: without(x.cities, c) }),
    })
  }

  for (const s of f.specialties) {
    chips.push({
      id: `spec:${s}`,
      label: s,
      clear: (x) => ({ ...x, specialties: without(x.specialties, s) }),
    })
  }

  for (const p of f.proficiencies) {
    chips.push({
      id: `prof:${p}`,
      label: p,
      clear: (x) => ({ ...x, proficiencies: without(x.proficiencies, p) }),
    })
  }

  for (const e of f.equipment) {
    chips.push({
      id: `eq:${e}`,
      label: e,
      clear: (x) => ({ ...x, equipment: without(x.equipment, e) }),
    })
  }

  if (f.minRate > RATE_MIN || f.maxRate < RATE_MAX) {
    chips.push({
      id: 'rate',
      label: `${formatINR(f.minRate)} – ${formatINR(f.maxRate)}`,
      clear: (x) => ({ ...x, minRate: RATE_MIN, maxRate: RATE_MAX }),
    })
  }

  if (f.minRating > 0) {
    chips.push({
      id: 'rating',
      label: `${f.minRating.toFixed(1)}★ & up`,
      clear: (x) => ({ ...x, minRating: 0 }),
    })
  }

  if (f.minHires > 0) {
    chips.push({
      id: 'hires',
      label: `${f.minHires}+ hires`,
      clear: (x) => ({ ...x, minHires: 0 }),
    })
  }

  if (f.availableFrom || f.availableTo) {
    const from = f.availableFrom ? formatDate(f.availableFrom) : 'any'
    const to = f.availableTo ? formatDate(f.availableTo) : 'any'
    chips.push({
      id: 'dates',
      label: `Free ${from} – ${to}`,
      clear: (x) => ({ ...x, availableFrom: '', availableTo: '' }),
    })
  }

  if (f.sortBy !== 'relevance') {
    const label = SORT_OPTIONS.find((o) => o.key === f.sortBy)?.label ?? f.sortBy
    chips.push({ id: 'sort', label, clear: (x) => ({ ...x, sortBy: 'relevance' }) })
  }

  return chips
}

export function activeCount(f: Filters): number {
  return activeChips(f).length
}
