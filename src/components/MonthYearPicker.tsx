import { useEffect, useRef, useState } from 'react'
import { MONTHS } from '../lib/date'

/** Years offered at a time, and how far back the window opens from the current one. */
const YEARS_PER_PAGE = 12
const YEARS_BEHIND = 4

/**
 * The month and year of the week on screen, each opening its own jump list —
 * the month for a nearby shoot, the year for one seasons away.
 */
export default function MonthYearPicker({
  date,
  onPick,
}: {
  /** Any day inside the month currently being shown. */
  date: Date
  onPick: (year: number, month: number) => void
}) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const [open, setOpen] = useState<'month' | 'year' | null>(null)
  // The twelve years on offer, paged so any year is a few taps away.
  const [yearStart, setYearStart] = useState(year - YEARS_BEHIND)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle(which: 'month' | 'year') {
    // The year list reopens around whatever year is on screen, however far it paged last time.
    if (which === 'year') setYearStart(year - YEARS_BEHIND)
    setOpen((prev) => (prev === which ? null : which))
  }

  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearStart + i)

  return (
    <div ref={rootRef} className="relative flex flex-1 items-center justify-center gap-1">
      <TriggerButton open={open === 'month'} onClick={() => toggle('month')} label="Pick a month">
        {MONTHS[month]}
      </TriggerButton>
      <TriggerButton open={open === 'year'} onClick={() => toggle('year')} label="Pick a year">
        {year}
      </TriggerButton>

      {open && (
        <div
          role="listbox"
          aria-label={open === 'month' ? 'Months' : 'Years'}
          className="absolute left-1/2 top-full z-30 mt-1.5 w-52 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-xl shadow-black/50"
        >
          {open === 'year' && (
            <div className="mb-1.5 flex items-center gap-1">
              <PageButton
                label="Earlier years"
                onClick={() => setYearStart((y) => y - YEARS_PER_PAGE)}
                flip
              />
              <span className="flex-1 text-center text-[10px] font-semibold text-slate-400">
                {years[0]} – {years[years.length - 1]}
              </span>
              <PageButton
                label="Later years"
                onClick={() => setYearStart((y) => y + YEARS_PER_PAGE)}
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-1">
            {open === 'month'
              ? MONTHS.map((name, i) => (
                  <Cell
                    key={name}
                    current={i === month}
                    onClick={() => {
                      onPick(year, i)
                      setOpen(null)
                    }}
                  >
                    {name.slice(0, 3)}
                  </Cell>
                ))
              : years.map((y) => (
                  <Cell
                    key={y}
                    current={y === year}
                    onClick={() => {
                      onPick(y, month)
                      setOpen(null)
                    }}
                  >
                    {y}
                  </Cell>
                ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TriggerButton({
  open,
  onClick,
  label,
  children,
}: {
  open: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={label}
      className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium transition hover:bg-white/10 hover:text-white ${
        open ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
      }`}
    >
      {children}
    </button>
  )
}

function Cell({
  current,
  onClick,
  children,
}: {
  current: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={current}
      onClick={onClick}
      className={`rounded-lg py-1.5 text-[11px] font-medium transition ${
        current
          ? 'bg-indigo-500 text-white'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function PageButton({
  label,
  onClick,
  flip = false,
}: {
  label: string
  onClick: () => void
  flip?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={`h-3.5 w-3.5 ${flip ? 'rotate-180' : ''}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
      </svg>
    </button>
  )
}
