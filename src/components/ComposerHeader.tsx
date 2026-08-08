import { Link } from 'react-router-dom'

/** Shared top bar for the create flows — title plus a way back to the hub. */
export default function ComposerHeader({
  title,
  subtitle,
  backTo = '/create',
  backLabel = 'Back to create',
}: {
  title: string
  subtitle: string
  /** Where the arrow returns to, for composers opened from outside the create hub. */
  backTo?: string
  backLabel?: string
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-2.5">
      <Link
        to={backTo}
        aria-label={backLabel}
        className="shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 5-7 7 7 7" />
        </svg>
      </Link>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold leading-tight text-white">{title}</h1>
        <p className="truncate text-[11px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}
