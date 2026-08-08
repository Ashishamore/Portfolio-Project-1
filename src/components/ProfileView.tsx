import { useCallback, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { DayStatus, Photographer } from '../lib/types'
import { formatINR } from '../lib/date'
import { useStore } from '../lib/storeContext'
import AvailabilityCalendar from './AvailabilityCalendar'
import { Avatar, Chip, PinIcon, Section, Stars } from './ui'

export default function ProfileView({
  photographer,
  isOwn = false,
}: {
  photographer: Photographer
  isOwn?: boolean
}) {
  const {
    savedIds,
    followingIds,
    toggleSaved,
    toggleFollowing,
    dayStatus,
    assignmentsOn,
    posts,
    verification,
  } = useStore()
  const isSaved = savedIds.includes(photographer.id)
  const isFollowing = followingIds.includes(photographer.id)
  // Only the signed-in user's application is ours to read.
  const badge = isOwn ? verification.status : 'unverified'

  // Everything this photographer has posted, newest first — the feed is already
  // in that order, so filtering preserves it.
  const gallery = useMemo(
    () => posts.filter((p) => p.photographerId === photographer.id),
    [posts, photographer.id],
  )
  const galleryPath = isOwn ? '/profile/posts' : `/photographer/${photographer.id}/posts`

  // Your own calendar mirrors what you set on the Schedule tab; everyone else's
  // comes from their published booked dates.
  const occupied = useMemo(() => new Set(photographer.occupiedDates), [photographer.occupiedDates])
  const statusOf = useCallback(
    (iso: string): DayStatus =>
      isOwn ? dayStatus(iso) : occupied.has(iso) ? 'occupied' : 'available',
    [isOwn, dayStatus, occupied],
  )

  return (
    <div className="pb-4">
      <div className="px-5 pt-4">
        {/* Identity is centred so the name reads as the heading of the screen, with the
            stat card squared up underneath it. The own-profile actions live in the
            Profile title bar above this. */}
        <div className="flex flex-col items-center text-center">
          <Avatar name={photographer.name} gradient={photographer.gradient} image={photographer.avatar} size="lg" />
          <div className="mt-3 flex max-w-full items-center gap-1.5">
            <h1 className="min-w-0 truncate text-lg font-semibold text-white">{photographer.name}</h1>
            {badge === 'verified' && (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 fill-indigo-400"
                aria-label="Verified account"
                role="img"
              >
                <path d="m12 2 2.4 1.8 3-.2.9 2.8L21 8.2l-1 2.8 1 2.8-2.7 1.8-.9 2.8-3-.2L12 20l-2.4-1.8-3 .2-.9-2.8L3 13.8l1-2.8-1-2.8 2.7-1.8.9-2.8 3 .2Z" />
                <path
                  d="m8.8 12.1 2.2 2.2 4.2-4.5"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {/* Applying is visible on your own profile, so the wait is not a black hole. */}
          {badge === 'pending' && (
            <Link
              to="/settings/verification"
              className="mt-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300"
            >
              Verification in review
            </Link>
          )}
          {/* Handle and city share a line — two short facts that read as one caption. */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
            <span className="text-xs">{photographer.handle}</span>
            <span aria-hidden className="text-slate-600">
              ·
            </span>
            <span className="flex items-center gap-1">
              <PinIcon />
              {photographer.city}, {photographer.state}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 py-3">
          <Stat value={photographer.assignmentCount} label="Assignments" />
          <Stat value={photographer.timesHired} label="Hired" />
          <Stat value={formatFollowers(photographer.followers)} label="Followers" />
          <Stat value={photographer.rating.toFixed(1)} label="Rating" />
        </div>

        {/* Headed like the sections below, so the bio and the pills each read as
            an answer to a question rather than loose text under the stats. */}
        <h2 className="mt-5 text-sm font-semibold text-white">{isOwn ? 'About me' : 'About'}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{photographer.bio}</p>

        <h2 className="mt-5 text-sm font-semibold text-white">Specialisations</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {photographer.specialties.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>

        {/* Level and rate sit in one card, split down the middle — the two things people
            check before they read anything else. */}
        <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Fact label="Level" value={photographer.proficiency}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
              <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
              <path
                strokeLinecap="round"
                d="M9 7.5V6.2a1.7 1.7 0 0 1 1.7-1.7h2.6A1.7 1.7 0 0 1 15 6.2v1.3"
              />
              <path strokeLinecap="round" d="M3.5 12.5h17" />
            </svg>
          </Fact>

          <Fact
            label="Per day"
            value={`Starts at ${formatINR(photographer.dayRate)}`}
            className="border-l border-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
              <path
                strokeLinejoin="round"
                d="M4 11.4V5.6A1.6 1.6 0 0 1 5.6 4h5.8c.42 0 .83.17 1.13.47l7 7a1.6 1.6 0 0 1 0 2.26l-5.8 5.8a1.6 1.6 0 0 1-2.26 0l-7-7A1.6 1.6 0 0 1 4 11.4Z"
              />
              <circle cx="8.3" cy="8.3" r="1.15" fill="currentColor" stroke="none" />
            </svg>
          </Fact>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">Responds {photographer.respondsIn}</p>
          {!isOwn && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => toggleSaved(photographer.id)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isSaved
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => toggleFollowing(photographer.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isFollowing
                    ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                    : 'bg-indigo-500 text-white hover:bg-indigo-400'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Availability sits with the rate above it — the two booking questions answered
          together — and the work, kit and reviews read as evidence underneath. */}
      <Section title="Availability">
        <AvailabilityCalendar
          statusOf={statusOf}
          caption={isOwn ? 'Tap a day for its schedule. Set statuses from the Schedule tab.' : undefined}
          // Only your own shoots are ours to list; other profiles publish booked days alone.
          eventsOn={isOwn ? assignmentsOn : undefined}
          canCreate={isOwn}
        />
      </Section>

      <Section
        title="Recent work"
        action={
          gallery.length > 0 && (
            <Link to={galleryPath} className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300">
              See all
            </Link>
          )
        }
      >
        {gallery.length > 0 ? (
          // The whole gallery on one rail rather than a four-up crop, so scrolling sideways
          // reaches every photo. Each tile still opens the feed sitting on that photo.
          <div className="-mx-5 flex snap-x gap-1 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((post) => (
              <Link
                key={post.id}
                to={`${galleryPath}?post=${post.id}`}
                className="aspect-square w-[calc((100%-0.75rem)/4)] shrink-0 snap-start overflow-hidden rounded-lg bg-white/5 transition hover:opacity-80"
              >
                <img src={post.image} alt={post.alt} className="h-full w-full object-cover" loading="lazy" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center">
            <p className="text-xs text-slate-400">
              {isOwn ? 'Photos you post show up here.' : 'No posts yet.'}
            </p>
            {isOwn && (
              <Link
                to="/create/post"
                className="mt-2 inline-block text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Share your first photo
              </Link>
            )}
          </div>
        )}
      </Section>

      <Section title="Equipment">
        <div className="space-y-2">
          {photographer.equipment.map((group) => (
            <div key={group.category} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{group.category}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{group.items.join(' · ')}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={`Reviews (${photographer.reviews.length})`}>
        <div className="space-y-2.5">
          {photographer.reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <div className="flex items-center gap-2.5">
                <Avatar name={r.author} gradient={r.authorGradient} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{r.author}</p>
                  <p className="text-[10px] text-slate-500">{r.daysAgo}d ago</p>
                </div>
                <Stars rating={r.rating} className="text-[11px]" />
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-300">{r.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

/** One half of the level/rate card: icon, the field name, then the value under it. */
function Fact({
  label,
  value,
  className = '',
  children,
}: {
  label: string
  value: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-3 ${className}`}>
      <span className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-1.5 text-indigo-300">
        {children}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-[13px] font-semibold text-indigo-300">{value}</p>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-1 text-center">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-slate-500">{label}</p>
    </div>
  )
}

function formatFollowers(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`
}
