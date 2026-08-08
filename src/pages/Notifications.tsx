import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { timeAgo } from '../lib/date'
import type { AppNotification, NotificationKind } from '../lib/types'
import { Avatar, InviteBadge } from '../components/ui'

export default function Notifications() {
  const { notifications, unreadNotificationCount, markAllNotificationsRead } = useStore()
  const navigate = useNavigate()

  // Unread first, so the reason for the badge is the first thing on screen.
  const fresh = notifications.filter((n) => !n.read)
  const earlier = notifications.filter((n) => n.read)

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-5 items-center text-slate-300 transition hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" />
          </svg>
        </button>

        <h1 className="flex-1 text-xs font-semibold text-white">Notifications</h1>

        {unreadNotificationCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/15 hover:text-indigo-300"
          >
            Mark all read
          </button>
        )}
      </header>

      {notifications.length === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-slate-500">Nothing new right now.</p>
      ) : (
        <>
          {fresh.length > 0 && (
            <NotificationGroup label={`New · ${fresh.length}`} rows={fresh} />
          )}
          {earlier.length > 0 && <NotificationGroup label="Earlier" rows={earlier} />}
        </>
      )}
    </div>
  )
}

function NotificationGroup({ label, rows }: { label: string; rows: AppNotification[] }) {
  return (
    <section>
      <h2 className="px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h2>
      <ul className="divide-y divide-white/5">
        {rows.map((n) => (
          <NotificationRow key={n.id} notification={n} />
        ))}
      </ul>
    </section>
  )
}

/** One row. Opening it clears its own unread state, the way tapping a mail does. */
function NotificationRow({ notification: n }: { notification: AppNotification }) {
  const { getPhotographer, markNotificationRead, followingIds, toggleFollowing, inviteStatus, currentUser } =
    useStore()
  const actorId = n.actorId
  const actor = actorId ? getPhotographer(actorId) : undefined
  const accent = KIND_ACCENTS[n.kind]
  // Invitations carry their live state, so an answered one stops asking.
  const invite = n.assignmentId ? inviteStatus(n.assignmentId, currentUser.id) : undefined

  return (
    <li className={`flex items-start gap-3 px-5 py-3.5 ${n.read ? '' : 'bg-indigo-500/[0.07]'}`}>
      <Link
        to={n.to}
        onClick={() => markNotificationRead(n.id)}
        className="flex min-w-0 flex-1 items-start gap-3 transition hover:opacity-80"
      >
        <span className="relative shrink-0">
          {actor ? (
            <Avatar name={actor.name} gradient={actor.gradient} image={actor.avatar} />
          ) : (
            // App-raised reminders have no one behind them, so the icon carries the row.
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${accent.tile}`}
            >
              <KindIcon kind={n.kind} className="h-5 w-5" />
            </span>
          )}
          {actor && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-slate-950 ${accent.badge}`}
            >
              <KindIcon kind={n.kind} className="h-3 w-3" />
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug text-slate-300">
            {actor && <span className="font-semibold text-white">{actor.name} </span>}
            <span className={actor ? '' : 'font-semibold text-white'}>{n.title}</span>
          </p>

          {n.detail && (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-400">{n.detail}</p>
          )}

          <div className="mt-1 flex items-center gap-2">
            <p className="text-[10px] text-slate-500">{timeAgo(n.minutesAgo)} ago</p>
            {invite && <InviteBadge status={invite} compact />}
          </div>
        </div>
      </Link>

      {/* A follow is the one kind you can answer without leaving the list. */}
      {n.kind === 'follow' && actorId ? (
        <FollowBackButton
          following={followingIds.includes(actorId)}
          onClick={() => toggleFollowing(actorId)}
        />
      ) : (
        !n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
      )}
    </li>
  )
}

function FollowBackButton({ following, onClick }: { following: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
        following
          ? 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          : 'bg-indigo-500 text-white hover:bg-indigo-400'
      }`}
    >
      {following ? 'Following' : 'Follow back'}
    </button>
  )
}

const KIND_ACCENTS: Record<NotificationKind, { badge: string; tile: string }> = {
  follow: { badge: 'bg-sky-500 text-white', tile: 'border-sky-400/25 bg-sky-500/15 text-sky-300' },
  comment: {
    badge: 'bg-violet-500 text-white',
    tile: 'border-violet-400/25 bg-violet-500/15 text-violet-300',
  },
  assignment: {
    badge: 'bg-amber-500 text-slate-950',
    tile: 'border-amber-400/25 bg-amber-500/15 text-amber-300',
  },
  message: {
    badge: 'bg-emerald-500 text-white',
    tile: 'border-emerald-400/25 bg-emerald-500/15 text-emerald-300',
  },
  reminder: {
    badge: 'bg-rose-500 text-white',
    tile: 'border-rose-400/25 bg-rose-500/15 text-rose-300',
  },
}

function KindIcon({ kind, className }: { kind: NotificationKind; className: string }) {
  const props = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }

  switch (kind) {
    case 'follow':
      return (
        <svg {...props}>
          <circle cx="10" cy="8" r="3.5" />
          <path d="M3.5 20c1-3 3.4-4.8 6.5-4.8" />
          <path d="M17.5 12.5v6M20.5 15.5h-6" />
        </svg>
      )
    case 'comment':
      return (
        <svg {...props}>
          <path d="M20 12c0 3.9-3.6 7-8 7a9 9 0 0 1-2.6-.38L5 20l1.2-3.3A6.6 6.6 0 0 1 4 12c0-3.9 3.6-7 8-7s8 3.1 8 7Z" />
        </svg>
      )
    case 'assignment':
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
          <path d="M3.5 10h17M8.5 3.5V6.5M15.5 3.5V6.5" />
        </svg>
      )
    case 'message':
      return (
        <svg {...props}>
          <rect x="3" y="5.5" width="18" height="13" rx="3" />
          <path d="m4 7.5 8 5.5 8-5.5" />
        </svg>
      )
    case 'reminder':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      )
  }
}
