import { addHoursToTime, formatLongDate, formatTime12 } from '../lib/date'
import type { Shift } from '../lib/types'
import { Avatar } from './ui'

/**
 * One crew member's own schedule on an assignment: which days of the run they
 * are hired for, and what hours they work on each.
 *
 * Days and hours are handed back one at a time rather than as a finished list, so
 * the same sheet drives a saved assignment through the store and a draft one
 * through local state.
 */
export default function CrewScheduleSheet({
  name,
  gradient,
  avatar,
  days,
  shifts,
  occupiedDates = [],
  onToggleDay,
  onSelectAll,
  onSetTime,
  onClose,
}: {
  name: string
  gradient: string
  avatar?: string
  /** Every day of the run, in order. */
  days: string[]
  /** The days this person currently works. Never empty. */
  shifts: Shift[]
  /** Days they are already booked on elsewhere, flagged as a clash. */
  occupiedDates?: string[]
  onToggleDay: (iso: string) => void
  /** Puts them on the whole run in one move, rather than a day at a time. */
  onSelectAll: () => void
  onSetTime: (iso: string, patch: { startTime?: string; durationHours?: number }) => void
  onClose: () => void
}) {
  const working = shifts.filter((s) => days.includes(s.date))
  const multiDay = days.length > 1

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

          <div className="flex items-center gap-2.5">
            <Avatar name={name} gradient={gradient} image={avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-white">{name}</h2>
              <p className="text-[10px] text-slate-400">
                {multiDay ? 'Pick the days they work and their hours' : 'Set the hours they work'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 text-xs font-semibold text-indigo-400">
              Done
            </button>
          </div>

          {multiDay && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Working {working.length} of {days.length} days
              </span>
              <button
                type="button"
                disabled={working.length === days.length}
                onClick={onSelectAll}
                className="ml-auto rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-35"
              >
                Every day
              </button>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5">
          {days.map((iso, index) => {
            const shift = working.find((s) => s.date === iso)
            // Nobody is on an assignment for no days at all — the last one they
            // hold stays put, and dropping them entirely is a separate action.
            const isOnlyDay = Boolean(shift) && working.length === 1
            const clashes = occupiedDates.includes(iso)

            return (
              <div
                key={iso}
                className={`rounded-xl border p-2.5 transition ${
                  shift ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <button
                  type="button"
                  disabled={isOnlyDay}
                  onClick={() => onToggleDay(iso)}
                  aria-pressed={Boolean(shift)}
                  title={isOnlyDay ? 'They need at least one day on the shoot' : undefined}
                  className="flex w-full items-center gap-2.5 text-left disabled:cursor-default"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      shift ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/25 text-transparent'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-white">
                      {multiDay ? `Day ${index + 1} · ` : ''}
                      {formatLongDate(iso)}
                    </span>
                    {clashes && (
                      <span className="block text-[10px] font-medium text-amber-400">
                        Already booked this day
                      </span>
                    )}
                  </span>
                </button>

                {shift && (
                  <div className="mt-2.5 space-y-1.5 border-t border-white/10 pt-2.5">
                    <div className="flex items-center gap-2">
                      <label className="min-w-0 flex-1">
                        <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                          Call time
                        </span>
                        <input
                          type="time"
                          value={shift.startTime}
                          onChange={(e) => e.target.value && onSetTime(iso, { startTime: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white [color-scheme:dark] focus:border-indigo-500/50 focus:outline-none"
                        />
                      </label>
                      <label className="w-20 shrink-0">
                        <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                          Hours
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={shift.durationHours}
                          onChange={(e) =>
                            onSetTime(iso, {
                              durationHours: Math.min(24, Math.max(1, Number(e.target.value) || 1)),
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:border-indigo-500/50 focus:outline-none"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {formatTime12(shift.startTime)} –{' '}
                      {formatTime12(addHoursToTime(shift.startTime, shift.durationHours))}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
