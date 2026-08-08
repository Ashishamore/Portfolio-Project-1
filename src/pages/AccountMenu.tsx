import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import BackHeader from '../components/BackHeader'
import { Avatar } from '../components/ui'

/**
 * Everything about the account that is not the profile itself: what has been
 * kept, what has been done, and the switches that govern both.
 */
export default function AccountMenu() {
  const navigate = useNavigate()
  const {
    currentUser,
    savedIds,
    savedPostIds,
    likedPostIds,
    followingIds,
    activity,
    verification,
    linkedAccounts,
    privacy,
    notificationPrefs,
  } = useStore()

  const [accountsOpen, setAccountsOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  const go = (to: string) => navigate(to)

  const notificationsOn = Object.entries(notificationPrefs).filter(
    ([key, on]) => key !== 'quietHours' && on,
  ).length

  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-6">
        <BackHeader title="Menu" subtitle={currentUser.handle} />

        {/* The account this menu belongs to, before anything it can do. */}
        <button
          type="button"
          onClick={() => go('/profile')}
          className="flex w-full items-center gap-3 border-b border-white/10 px-4 py-3 text-left transition hover:bg-white/5"
        >
          <Avatar
            name={currentUser.name}
            gradient={currentUser.gradient}
            image={currentUser.avatar}
            size="md"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{currentUser.name}</span>
            <span className="block truncate text-[11px] text-slate-500">
              {currentUser.handle} · View profile
            </span>
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 shrink-0 text-slate-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
          </svg>
        </button>

        <div>
          <GroupLabel>Your collection</GroupLabel>
          <Row
            icon={<BookmarkIcon />}
            label="Saved photographers"
            meta={savedIds.length}
            onClick={() => go('/saved?tab=photographers')}
          />
          <Row
            icon={<ImageIcon />}
            label="Saved posts"
            meta={savedPostIds.length}
            onClick={() => go('/saved?tab=posts')}
          />
          <Row
            icon={<HeartIcon />}
            label="Liked posts"
            meta={likedPostIds.length}
            onClick={() => go('/saved?tab=liked')}
          />
          <Row
            icon={<UsersIcon />}
            label="Following"
            meta={followingIds.length}
            onClick={() => go('/saved?tab=following')}
          />

          <GroupLabel>Your account</GroupLabel>
          <Row
            icon={<ClockIcon />}
            label="Activity log"
            meta={activity.length}
            onClick={() => go('/activity')}
          />
          <Row
            icon={<VerifiedIcon />}
            label="Get verified"
            meta={
              verification.status === 'pending'
                ? 'In review'
                : verification.status === 'verified'
                  ? 'Verified'
                  : undefined
            }
            onClick={() => go('/settings/verification')}
          />
          <Row
            icon={<SwitchIcon />}
            label="Add account"
            meta={linkedAccounts.length + 1}
            onClick={() => setAccountsOpen(true)}
          />

          <GroupLabel>Settings</GroupLabel>
          <Row
            icon={<BellIcon />}
            label="Notifications"
            meta={`${notificationsOn} on`}
            onClick={() => go('/settings/notifications')}
          />
          <Row
            icon={<LockIcon />}
            label="Account privacy"
            meta={privacy.privateAccount ? 'Private' : 'Public'}
            onClick={() => go('/settings/privacy')}
          />

          <div className="mt-3 border-t border-white/10 pt-3">
            <Row icon={<ExitIcon />} label="Log out" danger onClick={() => setConfirmSignOut(true)} />
          </div>

          <p className="px-4 pt-4 text-[10px] text-slate-600">Pulse · v1.0 preview</p>
        </div>
      </div>

      {accountsOpen && <AccountsSheet onClose={() => setAccountsOpen(false)} />}

      {confirmSignOut && <SignOutConfirm onCancel={() => setConfirmSignOut(false)} />}
    </div>
  )
}

/** The accounts on the device. Only one is signed in at a time in this preview. */
function AccountsSheet({ onClose }: { onClose: () => void }) {
  const { currentUser, linkedAccounts, addAccount } = useStore()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [error, setError] = useState('')

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const cleanHandle = handle.trim().replace(/\s+/g, '')
    if (!name.trim() || cleanHandle.replace('@', '').length < 2) {
      setError('Add a name and a username of at least two characters.')
      return
    }
    addAccount({
      name: name.trim(),
      handle: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`,
    })
    setName('')
    setHandle('')
    setError('')
    setAdding(false)
  }

  return (
    <Sheet onClose={onClose} title="Accounts">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2.5">
          <Avatar
            name={currentUser.name}
            gradient={currentUser.gradient}
            image={currentUser.avatar}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{currentUser.name}</p>
            <p className="truncate text-[10px] text-slate-400">{currentUser.handle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-300">
            Signed in
          </span>
        </div>

        {linkedAccounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
          >
            <Avatar name={account.name} gradient={account.gradient} image={account.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{account.name}</p>
              <p className="truncate text-[10px] text-slate-500">{account.handle}</p>
            </div>
            <button
              type="button"
              disabled
              title="Switching accounts is not part of this preview"
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-400 opacity-50"
            >
              Switch
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="mt-3 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Account name"
            className={sheetInput}
          />
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@username"
            className={sheetInput}
          />
          {error && <p className="text-[11px] text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
            >
              Add account
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-white/15 py-2.5 text-xs font-medium text-slate-400 transition hover:border-indigo-500/40 hover:text-white"
        >
          + Add account
        </button>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
        Accounts you add are listed on this device. Signing in as another one is not part of this
        preview.
      </p>
    </Sheet>
  )
}

function SignOutConfirm({ onCancel }: { onCancel: () => void }) {
  const { signOut } = useStore()
  const navigate = useNavigate()

  return (
    <Sheet onClose={onCancel} title="Log out?">
      <p className="text-xs leading-relaxed text-slate-400">
        This ends the session. Saved photographers, likes, drafts and profile edits made in this
        preview go back to how they started.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => {
            signOut()
            navigate('/signed-out')
          }}
          className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
        >
          Log out
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Stay
        </button>
      </div>
    </Sheet>
  )
}

/** Bottom sheet shared by the menu's own dialogs. */
function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative max-h-[85%] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-900 px-5 pb-6 pt-4">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <h2 className="mb-3 text-sm font-semibold text-white">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </p>
  )
}

function Row({
  icon,
  label,
  meta,
  danger = false,
  onClick,
}: {
  icon: ReactNode
  label: string
  /** Count or status shown at the right — what the row holds, before opening it. */
  meta?: ReactNode
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5 ${
        danger ? 'text-rose-300' : 'text-white'
      }`}
    >
      <span className={`shrink-0 ${danger ? 'text-rose-300' : 'text-slate-400'}`}>{icon}</span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{label}</span>
      {meta !== undefined && meta !== '' && (
        <span className="shrink-0 text-[10px] text-slate-500">{meta}</span>
      )}
      {!danger && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-3.5 w-3.5 shrink-0 text-slate-600"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

const sheetInput =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none'

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  className: 'h-4 w-4',
} as const

function BookmarkIcon() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v17l-6-4.2L6 21z" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 16.5 4.5-4 4 3.5 3-2.5 4.5 4" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 19.5S3.5 14.6 3.5 9.2A3.9 3.9 0 0 1 12 6.9a3.9 3.9 0 0 1 8.5 2.3c0 5.4-8.5 10.3-8.5 10.3Z"
      />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.6a3.2 3.2 0 0 1 0 6.3M17.5 13.6A5.2 5.2 0 0 1 20.5 19" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7.5V12l3 2" />
    </svg>
  )
}

function VerifiedIcon() {
  return (
    <svg {...iconProps}>
      <path
        strokeLinejoin="round"
        d="m12 3 2.3 1.7 2.9-.2.9 2.7 2.4 1.6-1 2.7 1 2.7-2.4 1.6-.9 2.7-2.9-.2L12 21l-2.3-1.7-2.9.2-.9-2.7L3.5 15l1-2.7-1-2.7 2.4-1.6.9-2.7 2.9.2Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.8 12.2 2.2 2.2 4.2-4.4" />
    </svg>
  )
}

function SwitchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.4" />
      <path strokeLinecap="round" d="M5 20a7 7 0 0 1 9.5-6.5" />
      <path strokeLinecap="round" d="M18 14v6M15 17h6" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13.5 6 9.5Z"
      />
      <path strokeLinecap="round" d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
      <path strokeLinecap="round" d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </svg>
  )
}

function ExitIcon() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4.5H6.5v15H14M11 12h9m0 0-3-3m3 3-3 3" />
    </svg>
  )
}
