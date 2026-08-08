import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import {
  addDays,
  formatDayHeading,
  formatTime12,
  fromISO,
  toISO,
  weekOf,
  weekdayName,
} from '../lib/date'
import type { Assignment } from '../lib/types'
import { Avatar, InviteBadge, PinIcon } from '../components/ui'
import DayStatusPill from '../components/DayStatusPill'
import MonthYearPicker from '../components/MonthYearPicker'
import WeekStrip from '../components/WeekStrip'

/** Shared by the header's two view controls, so they read as one pair. */
const HEADER_CHIP =
  'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/15 hover:text-indigo-300'

export default function Schedule() {
  const { currentUser, assignmentsOn, dayStatus, setDayStatus, isDayLocked, getPhotographer } =
    useStore()
  const location = useLocation()

  const todayISO = toISO(new Date())
  // Landing here straight after creating an assignment jumps to that shoot's date.
  const focusDate = (location.state as { focusDate?: string } | null)?.focusDate
  const newAssignmentId = (location.state as { assignmentId?: string } | null)?.assignmentId

  const [selected, setSelected] = useState(focusDate ?? todayISO)
  // Trims the week down to the days that actually have shoots on them.
  const [hideEmpty, setHideEmpty] = useState(false)
  const dayRefs = useRef<Record<string, HTMLElement | null>>({})
  const headerRef = useRef<HTMLElement | null>(null)
  // Day sections scroll to just below the sticky header instead of behind it.
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (focusDate) setSelected(focusDate)
  }, [focusDate])

  const week = useMemo(() => weekOf(selected), [selected])
  const cursor = fromISO(selected)

  // The picked day stays on screen even when it is empty — it is the one being
  // looked at, and its status pill is the only place to mark the day off.
  const visibleDays = useMemo(
    () =>
      hideEmpty ? week.filter((iso) => iso === selected || assignmentsOn(iso).length > 0) : week,
    [hideEmpty, week, selected, assignmentsOn],
  )
  const hiddenCount = week.length - visibleDays.length

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setHeaderHeight(el.offsetHeight))
    observer.observe(el)
    setHeaderHeight(el.offsetHeight)
    return () => observer.disconnect()
  }, [])

  // Bring the picked day into view, clear of the sticky header.
  useEffect(() => {
    if (!headerHeight) return
    dayRefs.current[selected]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selected, headerHeight])

  // Names whoever booked the user that day, so the locked pill explains itself.
  function lockReason(iso: string): string | undefined {
    const booking = assignmentsOn(iso).find(
      (a) => a.ownerId !== currentUser.id && a.participantIds.includes(currentUser.id),
    )
    if (!booking) return undefined
    const owner = getPhotographer(booking.ownerId)
    return `${owner?.name ?? 'Someone'} booked you on "${booking.name}", so this day stays Occupied.`
  }

  return (
    <div className="flex h-full flex-col">
      <header
        ref={headerRef}
        className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 px-5 pb-3 pt-3 backdrop-blur"
      >
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-white">Schedule</h1>
          {/* The page's one creative action, kept in reach from any week. */}
          <Link
            to="/create/assignment"
            className="shrink-0 rounded-xl bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-400"
          >
            + New assignment
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {/* Paging lands on the first day of the week so the list reads from the top. */}
          <WeekNavButton
            label="Previous week"
            onClick={() => setSelected(toISO(addDays(fromISO(week[0]), -7)))}
            flip
          />
          {/* Jumping months or years lands on the 1st, the way paging lands on a week's start. */}
          <MonthYearPicker
            date={cursor}
            onPick={(year, month) => setSelected(toISO(new Date(year, month, 1)))}
          />
          <WeekNavButton
            label="Next week"
            onClick={() => setSelected(toISO(addDays(fromISO(week[6]), 1)))}
          />
        </div>

        <div className="mt-1">
          <WeekStrip
            week={week}
            selected={selected}
            today={todayISO}
            statusOf={dayStatus}
            hasEvents={(iso) => assignmentsOn(iso).length > 0}
            onSelect={setSelected}
          />
        </div>

        {/* The two view controls sit together: what the list shows, and where it sits. */}
        <div className="mt-2 flex items-center gap-2">
          {/* The eye says what tapping does, not what the list currently is. */}
          <button
            type="button"
            onClick={() => setHideEmpty((v) => !v)}
            aria-pressed={hideEmpty}
            aria-label={
              hideEmpty
                ? `Show dates with no scheduled event, ${hiddenCount} hidden`
                : 'Hide dates with no scheduled event'
            }
            className={`${HEADER_CHIP} min-w-0`}
          >
            <EyeIcon open={hideEmpty} />
            <span className="truncate">
              {hideEmpty ? 'Show' : 'Hide'} dates with no scheduled event
            </span>
            {hideEmpty && hiddenCount > 0 && (
              <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-slate-400">
                {hiddenCount}
              </span>
            )}
          </button>

          {/* Stays in place once you are already on today, so the row never shifts. */}
          <button
            type="button"
            onClick={() => setSelected(todayISO)}
            disabled={selected === todayISO}
            className={`${HEADER_CHIP} shrink-0 disabled:pointer-events-none disabled:opacity-35`}
          >
            Jump to today
          </button>
        </div>
      </header>

      <div className="flex-1 divide-y divide-white/5">
        {visibleDays.map((iso) => {
          const events = assignmentsOn(iso)
          const status = dayStatus(iso)

          return (
            <section
              key={iso}
              ref={(el) => {
                dayRefs.current[iso] = el
              }}
              style={{ scrollMarginTop: headerHeight }}
              className={`px-5 py-4 transition-colors ${iso === selected ? 'bg-white/[0.04]' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-semibold text-white">{formatDayHeading(iso)}</h2>
                  <span className="text-xs text-slate-400">{weekdayName(iso)}</span>
                  {iso === todayISO && (
                    <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-300">
                      Today
                    </span>
                  )}
                </div>
                <DayStatusPill
                  status={status}
                  dateLabel={`${formatDayHeading(iso)} ${weekdayName(iso)}`}
                  onChange={(next) => setDayStatus(iso, next)}
                  locked={isDayLocked(iso)}
                  lockReason={lockReason(iso)}
                />
              </div>

              {events.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No events</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {events.map((a) => (
                    <EventRow key={a.id} assignment={a} date={iso} isNew={a.id === newAssignmentId} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

/** One meeting block: time rail on the left, details on the right. Opens the
    assignment's own page, the way a calendar entry opens its meeting. */
function EventRow({
  assignment: a,
  date,
  isNew,
}: {
  assignment: Assignment
  date: string
  isNew: boolean
}) {
  const { getPhotographer, currentUser } = useStore()

  const isMine = a.ownerId === currentUser.id
  const owner = getPhotographer(a.ownerId)
  const myInvite = a.invites[currentUser.id]
  // The owner heads the team; participantIds is everyone else, which includes
  // the signed-in user on assignments they were invited onto.
  const crew = a.participantIds
    .map((id) => getPhotographer(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const teamSize = crew.length + 1

  // A multi-day shoot repeats on each date, so say which day of the run this is.
  const dayIndex = Math.round(
    (fromISO(date).getTime() - fromISO(a.startDate).getTime()) / 86_400_000,
  )

  return (
    <Link
      to={`/assignment/${a.id}`}
      className={`flex gap-3 rounded-xl p-1 transition hover:bg-white/5 ${
        isNew ? 'ring-1 ring-indigo-400/60' : ''
      }`}
    >
      <div className="w-[74px] shrink-0">
        <p className="text-sm font-semibold leading-tight text-indigo-300">
          {formatTime12(a.startTime)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {a.durationHours} {a.durationHours === 1 ? 'hour' : 'hours'}
        </p>
        <span
          className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            a.approved ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
          }`}
        >
          {a.approved ? 'Approved' : 'Unapproved'}
        </span>
      </div>

      {/* The accent stripe reads owned vs invited before any text does. */}
      <div
        className={`min-w-0 flex-1 border-l-2 pl-3 ${
          isMine ? 'border-indigo-400/50' : 'border-amber-400/50'
        }`}
      >
        <p className={`truncate text-sm font-semibold ${isMine ? 'text-indigo-300' : 'text-amber-200'}`}>
          {a.name}
        </p>

        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
          <PinIcon className="h-3 w-3 shrink-0" />
          <span className="truncate">{a.location}</span>
        </p>

        {a.durationDays > 1 && (
          <p className="mt-0.5 text-[10px] text-slate-500">
            Day {dayIndex + 1} of {a.durationDays}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {isMine ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-300">
              <span aria-hidden>👑</span> Created by you
            </span>
          ) : (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
              <span aria-hidden>📩</span>
              <span className="truncate">Added by {owner?.name ?? 'someone'}</span>
            </span>
          )}
          {/* A declined or unanswered shoot still shows here — it is the user's
              record of it — but says plainly that they are not committed. */}
          {myInvite && <InviteBadge status={myInvite} compact />}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex -space-x-2">
            {owner && (
              <span className="rounded-full ring-2 ring-slate-950">
                <Avatar name={owner.name} gradient={owner.gradient} image={owner.avatar} size="xs" />
              </span>
            )}
            {crew.slice(0, 3).map((p) => (
              <span key={p.id} className="rounded-full ring-2 ring-slate-950">
                <Avatar name={p.name} gradient={p.gradient} image={p.avatar} size="xs" />
              </span>
            ))}
            {crew.length > 3 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px] font-semibold text-slate-300 ring-2 ring-slate-950">
                +{crew.length - 3}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">Team of {teamSize}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            className="ml-auto h-3 w-3 shrink-0 text-slate-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
          </svg>
        </div>
      </div>
    </Link>
  )
}


/** Open when the button will bring hidden days back, struck through when it will take them away. */
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-3.5 w-3.5 shrink-0"
    >
      {open ? (
        <>
          <path d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.75" />
        </>
      ) : (
        <>
          <path d="M9.9 6.1A9.9 9.9 0 0 1 12 5.75c6 0 9.5 6.25 9.5 6.25a17.6 17.6 0 0 1-3.4 4.15M6.7 7.85A17.4 17.4 0 0 0 2.5 12S6 18.25 12 18.25c1.2 0 2.3-.25 3.3-.65" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          <path d="m4.5 4.5 15 15" />
        </>
      )}
    </svg>
  )
}

function WeekNavButton({
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
      className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={`h-4 w-4 ${flip ? 'rotate-180' : ''}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
      </svg>
    </button>
  )
}
