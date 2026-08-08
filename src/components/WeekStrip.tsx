import { WEEKDAYS, fromISO } from '../lib/date'
import type { DayStatus } from '../lib/types'

/**
 * The Sunday-first week rail. The circle carries the user's availability and the
 * dot underneath flags days that have shoots on them — two separate things, since
 * a day can be staffed by the crew while the user stays free.
 */
export default function WeekStrip({
  week,
  selected,
  today,
  statusOf,
  hasEvents,
  onSelect,
}: {
  week: string[]
  selected: string
  today: string
  statusOf: (iso: string) => DayStatus
  hasEvents: (iso: string) => boolean
  onSelect: (iso: string) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {week.map((iso, i) => {
        const status = statusOf(iso)
        const isSelected = iso === selected
        const isToday = iso === today

        let circle = 'text-slate-300 hover:bg-white/10'
        if (isSelected) circle = 'bg-indigo-500 text-white'
        else if (status === 'occupied') circle = 'bg-white/10 text-white'
        else if (status === 'unavailable') circle = 'text-slate-600'

        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            aria-label={iso}
            aria-current={isSelected ? 'date' : undefined}
            className="flex flex-col items-center gap-1 py-1"
          >
            <span className="text-[10px] font-medium text-slate-500">{WEEKDAYS[i]}</span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition ${circle} ${
                isToday && !isSelected ? 'ring-1 ring-indigo-400/60' : ''
              }`}
            >
              {String(fromISO(iso).getDate()).padStart(2, '0')}
            </span>
            <span
              className={`h-1 w-1 rounded-full ${
                hasEvents(iso) ? (isSelected ? 'bg-indigo-300' : 'bg-indigo-400') : 'bg-transparent'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
