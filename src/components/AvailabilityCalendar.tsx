import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  WEEKDAYS,
  addDays,
  formatDayHeading,
  formatTime12,
  fromISO,
  monthGrid,
  monthLabel,
  toISO,
  weekOf,
  weekdayName,
} from '../lib/date'
import { useStore } from '../lib/storeContext'
import { worksOn } from '../lib/shifts'
import DayStatusPill from './DayStatusPill'
import { InviteBadge, PinIcon } from './ui'
import type { Assignment, DayStatus } from '../lib/types'

const CELL_STYLES: Record<DayStatus, string> = {
  available: 'bg-emerald-500/15 text-emerald-300',
  occupied: 'bg-indigo-500/20 text-indigo-300',
  unavailable: 'bg-white/5 text-slate-500 line-through',
}

const STATUS_BADGES: Record<DayStatus, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-emerald-500/15 text-emerald-300' },
  occupied: { label: 'Occupied', className: 'bg-indigo-500/20 text-indigo-300' },
  unavailable: { label: 'Unavailable', className: 'bg-white/10 text-slate-400' },
}

/** How far ahead the arrows will page, in months. */
const MONTHS_AHEAD = 5

const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth()

export default function AvailabilityCalendar({
  statusOf,
  caption,
  eventsOn,
  canCreate = false,
  editable = false,
}: {
  statusOf: (iso: string) => DayStatus
  /** Shown under the legend, e.g. to say where the statuses are edited. */
  caption?: string
  /** What is booked on a day. Left out for people whose schedule is not ours to show. */
  eventsOn?: (iso: string) => Assignment[]
  /** Whether an empty day offers to start an assignment on it. */
  canCreate?: boolean
  /** Whether the day sheet lets the status be changed — only on the user's own calendar. */
  editable?: boolean
}) {
  const today = new Date()
  const todayISO = toISO(today)

  // Collapsed to a single week by default — the calendar icon opens the month.
  const [expanded, setExpanded] = useState(false)
  // The day the arrows page around; also decides which week or month is on screen.
  const [anchor, setAnchor] = useState(todayISO)
  const [openDay, setOpenDay] = useState<string | null>(null)

  const anchorDate = fromISO(anchor)
  const week = useMemo(() => weekOf(anchor), [anchor])
  const cells = useMemo<(Date | null)[]>(() => {
    if (!expanded) return week.map(fromISO)
    const d = fromISO(anchor)
    return monthGrid(d.getFullYear(), d.getMonth())
  }, [expanded, anchor, week])

  const lastMonth = new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD, 1)
  const backDisabled = expanded
    ? monthKey(anchorDate) <= monthKey(today)
    : week[0] <= weekOf(todayISO)[0]
  const forwardDisabled = expanded
    ? monthKey(anchorDate) >= monthKey(lastMonth)
    : monthKey(fromISO(week[6])) >= monthKey(lastMonth)

  function page(direction: 1 | -1) {
    setAnchor(
      expanded
        ? toISO(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + direction, 1))
        : toISO(addDays(anchorDate, direction * 7)),
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => page(-1)}
          disabled={backDisabled}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"
          aria-label={expanded ? 'Previous month' : 'Previous week'}
        >
          <Chevron className="rotate-180" />
        </button>

        <span className="flex-1 text-center text-xs font-semibold text-white">
          {expanded
            ? monthLabel(anchorDate.getFullYear(), anchorDate.getMonth())
            : `${formatDayHeading(week[0])} – ${formatDayHeading(week[6])}`}
        </span>

        <button
          type="button"
          onClick={() => page(1)}
          disabled={forwardDisabled}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"
          aria-label={expanded ? 'Next month' : 'Next week'}
        >
          <Chevron />
        </button>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-pressed={expanded}
          aria-label={expanded ? 'Show this week only' : 'Show the whole month'}
          title={expanded ? 'Show this week only' : 'Show the whole month'}
          className={`ml-1 rounded-lg border p-1.5 transition ${
            expanded
              ? 'border-indigo-400/40 bg-indigo-500/20 text-indigo-300'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-4 w-4">
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
            <path strokeLinecap="round" d="M3.5 9.5h17M8 3.5V6M16 3.5V6" />
          </svg>
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-slate-500">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />

          const iso = toISO(date)
          const isPast = iso < todayISO
          const isToday = iso === todayISO
          const booked = eventsOn ? eventsOn(iso).length > 0 : false

          return (
            <button
              key={iso}
              type="button"
              onClick={() => setOpenDay(iso)}
              aria-label={`${formatDayHeading(iso)} ${weekdayName(iso)}`}
              className={`relative flex h-8 items-center justify-center rounded-lg text-[11px] font-medium transition hover:brightness-125 ${
                isPast ? 'text-slate-700' : CELL_STYLES[statusOf(iso)]
              } ${isToday ? 'ring-1 ring-inset ring-white/50' : ''}`}
            >
              {date.getDate()}
              {/* A day with shoots on it earns a dot, so the sheet is worth opening. */}
              {booked && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-current opacity-80" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-white/10 pt-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500/50" /> Occupied
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-white/15" /> Unavailable
        </span>
      </div>

      {caption && <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{caption}</p>}

      {openDay && (
        <DaySheet
          iso={openDay}
          status={statusOf(openDay)}
          events={eventsOn ? eventsOn(openDay) : null}
          canCreate={canCreate && openDay >= todayISO}
          // A day already behind us is a record, not a plan, so it stays read-only.
          editable={editable && openDay >= todayISO}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  )
}

/** What is on a single day, opened by tapping its cell. */
function DaySheet({
  iso,
  status,
  events,
  canCreate,
  editable,
  onClose,
}: {
  iso: string
  status: DayStatus
  /** `null` when this profile does not publish its schedule. */
  events: Assignment[] | null
  canCreate: boolean
  /** Whether the status is the user's to change from here. */
  editable: boolean
  onClose: () => void
}) {
  const { currentUser, getPhotographer, setDayStatus, isDayLocked } = useStore()
  const badge = STATUS_BADGES[status]

  // A shoot the user accepted from someone else holds the day at Occupied — they
  // have already promised it away, so it is not theirs to mark free.
  const locked = isDayLocked(iso)
  const lockReason = useMemo(() => {
    if (!locked) return undefined
    const booking = events?.find(
      (a) =>
        a.ownerId !== currentUser.id &&
        a.invites[currentUser.id] === 'accepted' &&
        worksOn(a, currentUser.id, iso),
    )
    if (!booking) return undefined
    const owner = getPhotographer(booking.ownerId)
    return `${owner?.name ?? 'Someone'} booked you on "${booking.name}", so this day stays Occupied.`
  }, [locked, events, currentUser.id, iso, getPhotographer])

  // Unanswered invitations lead: they are the only thing on the day that still
  // wants something from the user. Everything else is already on the schedule.
  const invitations = events?.filter((a) => a.invites[currentUser.id] === 'awaited') ?? []
  const scheduled = events?.filter((a) => a.invites[currentUser.id] !== 'awaited') ?? []

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative max-h-[85%] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-900 pb-5">
        <div className="sticky top-0 z-10 bg-slate-900 px-5 pb-3 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white">
                {formatDayHeading(iso)} <span className="text-slate-400">{weekdayName(iso)}</span>
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {events === null
                  ? 'Availability only'
                  : events.length === 0
                    ? 'Nothing scheduled'
                    : `${events.length} ${events.length === 1 ? 'event' : 'events'}`}
                {invitations.length > 0 && (
                  <span className="text-amber-300">
                    {' '}
                    · {invitations.length} awaiting your answer
                  </span>
                )}
              </p>
            </div>
            {editable ? (
              <div className="shrink-0">
                <DayStatusPill
                  status={status}
                  dateLabel={`${formatDayHeading(iso)} ${weekdayName(iso)}`}
                  onChange={(next) => setDayStatus(iso, next)}
                  locked={locked}
                  lockReason={lockReason}
                />
              </div>
            ) : (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* The pill only carries the lock as a tooltip, which a touch screen never
              shows — so the reason it will not move is spelled out here instead. */}
          {editable && locked && lockReason && (
            <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-400">
              <span aria-hidden>🔒</span>
              <span>{lockReason}</span>
            </p>
          )}
        </div>

        <div className="px-5">
          {events === null ? (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-xs leading-relaxed text-slate-400">
              This photographer shares which days they are booked, not what they are booked for.
            </p>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center">
              <p className="text-xs text-slate-400">Nothing scheduled on this day.</p>
              {canCreate && (
                <Link
                  to="/create/assignment"
                  state={{ date: iso }}
                  className="mt-3 inline-block rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
                >
                  Create event
                </Link>
              )}
            </div>
          ) : (
            <>
              {invitations.length > 0 && (
                <>
                  <SheetLabel>
                    {invitations.length === 1 ? 'Invitation' : `Invitations (${invitations.length})`}
                  </SheetLabel>
                  <div className="space-y-1.5">
                    {invitations.map((a) => (
                      <InvitationCard key={a.id} assignment={a} />
                    ))}
                  </div>
                </>
              )}

              {scheduled.length > 0 && (
                <>
                  {/* Only worth a heading once invitations are sitting above them. */}
                  {invitations.length > 0 && <SheetLabel>On your schedule</SheetLabel>}
                  <div className="space-y-1.5">
                    {scheduled.map((a) => (
                      <EventLink key={a.id} assignment={a} />
                    ))}
                  </div>
                </>
              )}

              {/* A busy day is still a day you can book — the sheet never dead-ends
                  on the events already there. */}
              {canCreate && (
                <Link
                  to="/create/assignment"
                  state={{ date: iso }}
                  className="mt-2.5 block rounded-xl border border-dashed border-white/15 py-2.5 text-center text-xs font-medium text-slate-400 transition hover:border-indigo-500/40 hover:text-white"
                >
                  + Add another event
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SheetLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500 first:mt-0">
      {children}
    </p>
  )
}

/** An assignment already on the day: tap through to it, the way a calendar entry opens. */
function EventLink({ assignment: a }: { assignment: Assignment }) {
  const { currentUser } = useStore()
  const myInvite = a.invites[currentUser.id]

  return (
    <Link
      to={`/assignment/${a.id}`}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 transition hover:bg-white/10"
    >
      <div className="w-[68px] shrink-0">
        <p className="text-xs font-semibold text-indigo-300">{formatTime12(a.startTime)}</p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          {a.durationHours} {a.durationHours === 1 ? 'hour' : 'hours'}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{a.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
          <PinIcon className="h-3 w-3 shrink-0" />
          <span className="truncate">{a.location}</span>
        </p>
        {/* An answered invite keeps saying where it stands, so accepting or
            declining here reads as having taken. */}
        {myInvite && (
          <span className="mt-1 inline-block">
            <InviteBadge status={myInvite} compact />
          </span>
        )}
      </div>
      <Chevron className="shrink-0 text-slate-600" />
    </Link>
  )
}

/**
 * A shoot someone else added the user to on this day, answered from here rather
 * than only on the assignment's own page.
 */
function InvitationCard({ assignment: a }: { assignment: Assignment }) {
  const { getPhotographer, respondToInvite } = useStore()
  const owner = getPhotographer(a.ownerId)

  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5">
      <Link to={`/assignment/${a.id}`} className="flex items-center gap-3">
        <div className="w-[68px] shrink-0">
          <p className="text-xs font-semibold text-amber-200">{formatTime12(a.startTime)}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {a.durationHours} {a.durationHours === 1 ? 'hour' : 'hours'}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{a.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
            <PinIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{a.location}</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-300">
            <span aria-hidden>📩</span>
            <span className="truncate">Added by {owner?.name ?? 'someone'}</span>
          </p>
        </div>
        <Chevron className="shrink-0 text-slate-600" />
      </Link>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={() => respondToInvite(a.id, 'accepted')}
          className="flex-1 rounded-lg bg-indigo-500 py-2 text-[11px] font-semibold text-white transition hover:bg-indigo-400"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => respondToInvite(a.id, 'rejected')}
          className="flex-1 rounded-lg border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-4 w-4 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  )
}
