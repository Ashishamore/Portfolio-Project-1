/** Local-time ISO date (yyyy-mm-dd). Avoids the UTC shift of toISOString(). */
export function toISO(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

/** ISO date n days from today — used to keep mock availability relative to "now". */
export function isoFromToday(n: number): string {
  return toISO(addDays(new Date(), n))
}

export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`
}

/**
 * Day cells for a month grid, padded with nulls so the 1st lands on its weekday.
 */
export function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array(first.getDay()).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day))
  return cells
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

export function weekdayName(iso: string): string {
  return WEEKDAY_NAMES[fromISO(iso).getDay()]
}

/** "Apr 04" — the day heading on each schedule section. */
export function formatDayHeading(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1].slice(0, 3)} ${String(d).padStart(2, '0')}`
}

/** The seven days of the week (Sunday-first) containing `iso`. */
export function weekOf(iso: string): string[] {
  const start = fromISO(iso)
  start.setDate(start.getDate() - start.getDay())
  return Array.from({ length: 7 }, (_, i) => toISO(addDays(start, i)))
}

/** "Wednesday, 04 April 2026" — the date line on an assignment. */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${weekdayName(iso)}, ${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`
}

/** Wall-clock time `hours` after `time`, wrapping past midnight. */
export function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = (((h * 60 + m + Math.round(hours * 60)) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** 24h "06:00" → "06:00 AM", matching the schedule's time column. */
export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

/** Every ISO date an assignment covers, so a 3-day shoot blocks all three. */
export function assignmentDates(startDate: string, durationDays: number): string[] {
  const start = fromISO(startDate)
  return Array.from({ length: Math.max(1, durationDays) }, (_, i) => toISO(addDays(start, i)))
}

/** Relative stamp in messaging shorthand — now, 4m, 3h, 2d. */
export function timeAgo(minutes: number): string {
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`
  return `${Math.floor(minutes / (60 * 24))}d`
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}
