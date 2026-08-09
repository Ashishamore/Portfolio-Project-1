import { addHoursToTime, assignmentDates, formatTime12 } from './date'
import type { Assignment, Shift } from './types'

/** Every ISO date the assignment covers, in order. */
export function assignmentDays(a: Pick<Assignment, 'startDate' | 'durationDays'>): string[] {
  return assignmentDates(a.startDate, a.durationDays)
}

/** The whole shoot at the shoot's own call time — what a crew member gets by default. */
export function fullRun(
  a: Pick<Assignment, 'startDate' | 'durationDays' | 'startTime' | 'durationHours'>,
): Shift[] {
  return assignmentDays(a).map((date) => ({
    date,
    startTime: a.startTime,
    durationHours: a.durationHours,
  }))
}

function byDateThenTime(x: Shift, y: Shift): number {
  return x.date === y.date ? x.startTime.localeCompare(y.startTime) : x.date.localeCompare(y.date)
}

/**
 * The days one crew member works, soonest first. Anyone without their own entry
 * is on for the full run, so schedules read the same whether or not they were
 * ever split by hand.
 */
export function shiftsOf(a: Assignment, photographerId: string): Shift[] {
  const own = a.shifts[photographerId]
  if (!own || own.length === 0) return fullRun(a)
  return [...own].sort(byDateThenTime)
}

export function shiftOn(a: Assignment, photographerId: string, iso: string): Shift | undefined {
  return shiftsOf(a, photographerId).find((s) => s.date === iso)
}

export function worksOn(a: Assignment, photographerId: string, iso: string): boolean {
  if (photographerId === a.ownerId) return assignmentDays(a).includes(iso)
  if (!a.participantIds.includes(photographerId)) return false
  return Boolean(shiftOn(a, photographerId, iso))
}

/** The crew called for one day, in call-time order. Excludes the owner, as `participantIds` does. */
export function crewOn(a: Assignment, iso: string): string[] {
  return a.participantIds
    .filter((pid) => worksOn(a, pid, iso))
    .sort((x, y) => {
      const xs = shiftOn(a, x, iso)?.startTime ?? a.startTime
      const ys = shiftOn(a, y, iso)?.startTime ?? a.startTime
      return xs.localeCompare(ys)
    })
}

/** 0-based position of a date within the run, or -1 when it falls outside. */
export function dayIndex(a: Pick<Assignment, 'startDate' | 'durationDays'>, iso: string): number {
  return assignmentDays(a).indexOf(iso)
}

/** "Day 2" — how a date inside a multi-day run is named throughout the app. */
export function dayLabel(a: Pick<Assignment, 'startDate' | 'durationDays'>, iso: string): string {
  const index = dayIndex(a, iso)
  return index < 0 ? 'Off the run' : `Day ${index + 1}`
}

/** "06:00 AM – 02:00 PM" for one stint. */
export function shiftHours(shift: Shift): string {
  return `${formatTime12(shift.startTime)} – ${formatTime12(addHoursToTime(shift.startTime, shift.durationHours))}`
}

/** "All 3 days" · "Day 1, Day 3" — a crew member's run at a glance. */
export function describeDays(a: Assignment, photographerId: string): string {
  const days = assignmentDays(a)
  const worked = shiftsOf(a, photographerId).filter((s) => days.includes(s.date))

  if (days.length === 1) return 'The shoot day'
  if (worked.length === days.length) return `All ${days.length} days`
  return worked.map((s) => `Day ${days.indexOf(s.date) + 1}`).join(', ')
}

/**
 * One person's shifts rewritten to cover exactly `dates`. Days they already had
 * keep the hours they were given; new ones start on the shoot's own call time.
 */
export function withDays(a: Assignment, photographerId: string, dates: string[]): Shift[] {
  const existing = shiftsOf(a, photographerId)
  return assignmentDays(a)
    .filter((date) => dates.includes(date))
    .map(
      (date) =>
        existing.find((s) => s.date === date) ?? {
          date,
          startTime: a.startTime,
          durationHours: a.durationHours,
        },
    )
}

/**
 * Shifts carried across a change to the assignment's own dates, by position in
 * the run: whoever was on day 2 stays on day 2 when the shoot moves a week later.
 * Days that fall off a shortened run are dropped, and anyone left with nothing is
 * put back on the full run — a crew member with no days is not on the shoot at all.
 */
export function remapShifts(
  shifts: Record<string, Shift[]>,
  oldDates: string[],
  newDates: string[],
  fallback: Shift[],
): Record<string, Shift[]> {
  const remapped: Record<string, Shift[]> = {}

  for (const [pid, own] of Object.entries(shifts)) {
    const moved = own
      .map((shift) => {
        const next = newDates[oldDates.indexOf(shift.date)]
        return next ? { ...shift, date: next } : null
      })
      .filter((s): s is Shift => s !== null)

    remapped[pid] = moved.length > 0 ? moved.sort(byDateThenTime) : fallback
  }

  return remapped
}

/**
 * Crew hours that were never set by hand follow the shoot's own call time when it
 * changes. A shift that already differed from the old default is somebody's
 * specific arrangement — the late second shooter, the early drone slot — so it
 * stays exactly where it was put.
 */
export function retimeShifts(
  shifts: Record<string, Shift[]>,
  from: { startTime: string; durationHours: number },
  to: { startTime: string; durationHours: number },
): Record<string, Shift[]> {
  const retimed: Record<string, Shift[]> = {}

  for (const [pid, own] of Object.entries(shifts)) {
    retimed[pid] = own.map((shift) =>
      shift.startTime === from.startTime && shift.durationHours === from.durationHours
        ? { ...shift, startTime: to.startTime, durationHours: to.durationHours }
        : shift,
    )
  }

  return retimed
}

/** Days within the run that nobody but the owner is covering yet. */
export function unstaffedDays(a: Assignment): string[] {
  return assignmentDays(a).filter((iso) => crewOn(a, iso).length === 0)
}
