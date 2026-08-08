import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import type { ActivityEntry, ActivityKind } from '../lib/types'
import BackHeader from '../components/BackHeader'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'save', label: 'Saves' },
  { key: 'like', label: 'Likes' },
  { key: 'follow', label: 'Follows' },
  { key: 'assignment', label: 'Work' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const KIND_STYLES: Record<ActivityKind, { icon: string; className: string }> = {
  save: { icon: '🔖', className: 'bg-indigo-500/15 text-indigo-300' },
  like: { icon: '❤️', className: 'bg-rose-500/15 text-rose-300' },
  follow: { icon: '👤', className: 'bg-sky-500/15 text-sky-300' },
  post: { icon: '🖼️', className: 'bg-emerald-500/15 text-emerald-300' },
  story: { icon: '✨', className: 'bg-amber-500/15 text-amber-300' },
  assignment: { icon: '📋', className: 'bg-violet-500/15 text-violet-300' },
  invite: { icon: '📩', className: 'bg-amber-500/15 text-amber-300' },
  profile: { icon: '✏️', className: 'bg-white/10 text-slate-300' },
  account: { icon: '⚙️', className: 'bg-white/10 text-slate-300' },
}

/** 'Work' covers everything that happens on an assignment, however it started. */
const WORK_KINDS: ActivityKind[] = ['assignment', 'invite']

export default function ActivityLog() {
  const { activity, clearActivity } = useStore()
  const [filter, setFilter] = useState<FilterKey>('all')

  const shown = useMemo(
    () =>
      activity.filter((entry) => {
        if (filter === 'all') return true
        if (filter === 'assignment') return WORK_KINDS.includes(entry.kind)
        return entry.kind === filter
      }),
    [activity, filter],
  )

  // Newest first, split under the day each action happened on.
  const days = useMemo(() => {
    const groups: { label: string; entries: ActivityEntry[] }[] = []
    for (const entry of [...shown].sort((a, b) => b.at - a.at)) {
      const label = dayLabel(entry.at)
      const last = groups[groups.length - 1]
      if (last?.label === label) last.entries.push(entry)
      else groups.push({ label, entries: [entry] })
    }
    return groups
  }, [shown])

  return (
    <div className="h-full overflow-y-auto pb-6">
      <BackHeader
        title="Activity log"
        subtitle={`${activity.length} ${activity.length === 1 ? 'action' : 'actions'}`}
        action={
          activity.length > 0 ? (
            <button
              type="button"
              onClick={clearActivity}
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300"
            >
              Clear
            </button>
          ) : undefined
        }
      />

      <div className="flex gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={f.key === filter}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
              f.key === filter
                ? 'bg-indigo-500 text-white'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {days.length === 0 ? (
        <div className="mx-5 rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">
          <p className="text-xs text-slate-400">Nothing logged here yet.</p>
          <p className="mt-1.5 text-[10px] text-slate-600">
            Saves, likes, follows and the shoots you set up all land in this list.
          </p>
        </div>
      ) : (
        days.map((day) => (
          <section key={day.label} className="px-5 pb-2">
            <p className="pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {day.label}
            </p>
            <div className="space-y-1.5">
              {day.entries.map((entry) => (
                <ActivityRow key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const style = KIND_STYLES[entry.kind]

  const body = (
    <>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${style.className}`}
        aria-hidden
      >
        {style.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-white">{entry.title}</span>
        {entry.detail && (
          <span className="mt-0.5 block truncate text-[10px] text-slate-500">{entry.detail}</span>
        )}
      </span>
      <span className="shrink-0 text-[10px] text-slate-500">{clockTime(entry.at)}</span>
    </>
  )

  const className =
    'flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition'

  // Rows only lead somewhere when the thing they describe still exists.
  return entry.to ? (
    <Link to={entry.to} className={`${className} hover:bg-white/10`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

function dayLabel(at: number): string {
  const day = new Date(at)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (sameDay(day, today)) return 'Today'
  if (sameDay(day, yesterday)) return 'Yesterday'
  return day.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function clockTime(at: number): string {
  return new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
