import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { formatDayHeading, formatTime12, fromISO, toISO } from '../lib/date'
import type { Assignment } from '../lib/types'
import { Avatar, InviteBadge } from './ui'

/**
 * The next shoots on the calendar, as a horizontal rail. Cards keep the schedule's
 * anatomy — time rail, divider, details — so a shoot reads the same wherever it
 * turns up.
 */
export default function UpcomingAssignments() {
  const { assignments, currentUser } = useStore()

  const today = fromISO(toISO(new Date())).getTime()
  // A multi-day shoot still counts as upcoming while it is running, so compare
  // against its last day rather than its first. A shoot the user turned down is
  // no longer their agenda, so it drops off here — the schedule still keeps it.
  const upcoming = assignments
    .filter((a) => a.invites[currentUser.id] !== 'rejected')
    .filter((a) => fromISO(a.startDate).getTime() + (a.durationDays - 1) * 86_400_000 >= today)
    .sort((x, y) => `${x.startDate}${x.startTime}`.localeCompare(`${y.startDate}${y.startTime}`))
    .slice(0, 8)

  if (upcoming.length === 0) return null

  return (
    <section className="pt-4">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-sm font-semibold text-white">Upcoming assignments</h2>
        <Link
          to="/schedule"
          aria-label="See all assignments on the schedule"
          className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <Rail>
        {upcoming.map((a) => (
          <AssignmentCard key={a.id} assignment={a} />
        ))}
      </Rail>
    </section>
  )
}

/**
 * Snap-scrolling track with a progress bar underneath. The bar is the only cue
 * that more cards exist, since a phone has no scrollbar to show it.
 */
function Rail({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)
  // Fraction of the track on screen, and how far along it we are — both 0–1.
  const [thumb, setThumb] = useState({ size: 1, offset: 0 })

  const measure = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { clientWidth, scrollWidth, scrollLeft } = el
    const size = scrollWidth > 0 ? clientWidth / scrollWidth : 1
    // Guard the divide: a track with nothing to scroll would put 0 in the denominator.
    const scrollable = scrollWidth - clientWidth
    setThumb({ size, offset: scrollable > 0 ? scrollLeft / scrollable : 0 })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure])

  const scrollable = thumb.size < 0.999

  return (
    <>
      {/* Bleeds past the page gutter so the next card peeks in from the screen edge. */}
      <div
        ref={trackRef}
        onScroll={measure}
        className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {scrollable && (
        <div className="mx-auto mt-2 h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-indigo-400"
            style={{
              width: `${thumb.size * 100}%`,
              // The thumb travels the leftover track, so it lands flush at either end.
              marginLeft: `${thumb.offset * (1 - thumb.size) * 100}%`,
            }}
          />
        </div>
      )}
    </>
  )
}

function AssignmentCard({ assignment: a }: { assignment: Assignment }) {
  const { getPhotographer, currentUser } = useStore()

  const owner = getPhotographer(a.ownerId)
  // Only an unanswered invite earns space on the card — it is the one that
  // still needs something from the user.
  const needsAnswer = a.invites[currentUser.id] === 'awaited'
  // participantIds is everyone but the owner, so the team is one larger than it.
  const crew = a.participantIds
    .map((id) => getPhotographer(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const team = owner ? [owner, ...crew] : crew
  const isToday = a.startDate === toISO(new Date())

  return (
    <Link
      to={`/assignment/${a.id}`}
      className="flex w-[85%] shrink-0 snap-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:border-indigo-500/40 hover:bg-white/[0.08]"
    >
      <div className="w-[76px] shrink-0">
        <p className="text-[15px] font-semibold leading-tight text-indigo-300">
          {formatTime12(a.startTime)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {a.durationHours} {a.durationHours === 1 ? 'hour' : 'hours'}
        </p>
        <span
          className={`mt-2 inline-block rounded-md px-2 py-1 text-[10px] font-semibold ${
            a.approved ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
          }`}
        >
          {a.approved ? 'Approved' : 'Unapproved'}
        </span>
      </div>

      <div className="min-w-0 flex-1 border-l border-white/15 pl-3">
        <p className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-semibold text-indigo-300">{a.name}</span>
          {needsAnswer && <InviteBadge status="awaited" compact />}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">{a.location}</p>

        <p className="mt-0.5 text-[10px] text-slate-500">
          {isToday ? 'Today' : formatDayHeading(a.startDate)}
          {a.durationDays > 1 && ` · ${a.durationDays} days`}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex -space-x-2">
            {team.slice(0, 4).map((p) => (
              <span key={p.id} className="rounded-full ring-2 ring-slate-950">
                <Avatar name={p.name} gradient={p.gradient} image={p.avatar} size="xs" />
              </span>
            ))}
          </div>
          <span className="truncate text-[11px] text-slate-400">Team of {team.length}</span>
        </div>
      </div>
    </Link>
  )
}
