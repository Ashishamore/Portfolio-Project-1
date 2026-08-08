import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { DayStatus } from '../lib/types'

const STYLES: Record<DayStatus, string> = {
  occupied: 'border-indigo-400/30 bg-indigo-500/20 text-indigo-300',
  available: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
  unavailable: 'border-white/15 bg-white/10 text-slate-400',
}

/** Swatch colours for the menu rows, mirroring the profile calendar legend. */
const DOTS: Record<DayStatus, string> = {
  occupied: 'bg-indigo-400',
  available: 'bg-emerald-400',
  unavailable: 'bg-white/30',
}

const LABELS: Record<DayStatus, string> = {
  occupied: 'Occupied',
  available: 'Available',
  unavailable: 'Unavailable',
}

const HINTS: Record<DayStatus, string> = {
  occupied: 'Working this day',
  available: 'Open to book',
  unavailable: 'Not taking work',
}

const ORDER: DayStatus[] = ['occupied', 'available', 'unavailable']

/**
 * The user's availability for one day, as it appears on their profile calendar.
 * Every day is switchable — booking a shoot does not decide whether the user
 * themselves is free, since they may send the crew and work elsewhere.
 *
 * Uses a themed popover rather than a native <select>, whose option list is
 * drawn by the OS and cannot be made to match the app.
 */
export default function DayStatusPill({
  status,
  onChange,
  dateLabel,
  locked = false,
  lockReason,
}: {
  status: DayStatus
  onChange: (next: DayStatus) => void
  dateLabel: string
  /** Someone else booked the user this day, so the status is not theirs to change. */
  locked?: boolean
  lockReason?: string
}) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Open upwards when the day sits too low in the scroller to fit the menu.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const trigger = triggerRef.current.getBoundingClientRect()
    const bottom = scrollBottom(triggerRef.current)
    setDropUp(trigger.bottom + MENU_HEIGHT > bottom)
  }, [open])

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (locked) {
    return (
      <span
        title={lockReason}
        aria-label={`Your availability on ${dateLabel}: ${LABELS[status]}. ${lockReason ?? ''}`}
        className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${STYLES[status]}`}
      >
        <LockIcon />
        {LABELS[status]}
      </span>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Your availability on ${dateLabel}: ${LABELS[status]}`}
        className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition hover:brightness-125 ${STYLES[status]}`}
      >
        <span>{LABELS[status]}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className={`h-3 w-3 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`Availability options for ${dateLabel}`}
          className={`absolute right-0 z-30 w-44 rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl shadow-black/50 ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {ORDER.map((option) => {
            const selected = option === status
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${
                  selected ? 'bg-indigo-500/15' : 'hover:bg-white/5'
                }`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${DOTS[option]}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-white">{LABELS[option]}</span>
                  <span className="block text-[10px] text-slate-500">{HINTS[option]}</span>
                </span>
                {selected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="h-3.5 w-3.5 shrink-0 text-indigo-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 opacity-80">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path strokeLinecap="round" d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  )
}

/** Roughly the menu's rendered height — three rows plus padding. */
const MENU_HEIGHT = 130

/** Bottom edge of the nearest scrolling ancestor, so the flip respects the phone frame. */
function scrollBottom(el: HTMLElement): number {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY
    if (overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden') {
      return node.getBoundingClientRect().bottom
    }
  }
  return window.innerHeight
}
