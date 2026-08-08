import type { ReactNode } from 'react'
import type { InviteStatus } from '../lib/types'

export function Avatar({
  name,
  gradient,
  image,
  size = 'md',
}: {
  name: string
  gradient: string
  /** Profile photo. Without one the initials carry the avatar, as they always have. */
  image?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}) {
  const dims = {
    xs: 'h-6 w-6 text-[9px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-12 w-12 text-sm',
    lg: 'h-20 w-20 text-xl',
  }[size]

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        loading="lazy"
        className={`${dims} shrink-0 rounded-full bg-white/5 object-cover`}
      />
    )
  }

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  return (
    <div
      className={`${dims} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white`}
    >
      {initials}
    </div>
  )
}

/** Compact square action for title bars — icon only, labelled for screen readers. */
export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  )
}

/** A settings switch: the label explains it, the track carries the state. */
export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{hint}</span>}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 ${
          checked ? 'bg-indigo-500' : 'bg-white/15'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
    </label>
  )
}

export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400">
        <path d="m12 2.5 2.9 5.9 6.6.9-4.8 4.6 1.2 6.5L12 17.3 6.1 20.4l1.2-6.5L2.5 9.3l6.6-.9z" />
      </svg>
      <span className="font-medium text-white">{rating.toFixed(1)}</span>
    </span>
  )
}

export function Chip({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  const base = 'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition'
  const style = active
    ? 'bg-indigo-500 text-white'
    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'

  if (!onClick) return <span className={`${base} ${style}`}>{children}</span>
  return (
    <button type="button" onClick={onClick} className={`${base} ${style}`}>
      {children}
    </button>
  )
}

const PROFICIENCY_STYLES: Record<string, string> = {
  Emerging: 'bg-slate-500/15 text-slate-300 border-slate-400/25',
  Intermediate: 'bg-sky-500/15 text-sky-300 border-sky-400/25',
  Advanced: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
  Expert: 'bg-amber-500/15 text-amber-300 border-amber-400/25',
}

export function ProficiencyBadge({ level }: { level: string }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        PROFICIENCY_STYLES[level] ?? PROFICIENCY_STYLES.Emerging
      }`}
    >
      {level}
    </span>
  )
}

export function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

const INVITE_STYLES: Record<InviteStatus, { label: string; short: string; className: string }> = {
  awaited: {
    label: 'Response awaited',
    short: 'Awaited',
    className: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
  },
  accepted: {
    label: 'Accepted',
    short: 'Accepted',
    className: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
  },
  rejected: {
    label: 'Declined',
    short: 'Declined',
    className: 'border-rose-400/30 bg-rose-500/15 text-rose-300',
  },
}

/** Where someone stands on their invite. `compact` shortens it for tight rows. */
export function InviteBadge({
  status,
  compact = false,
}: {
  status: InviteStatus
  compact?: boolean
}) {
  const style = INVITE_STYLES[status]
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${style.className}`}
    >
      {compact ? style.short : style.label}
    </span>
  )
}

export function PinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
