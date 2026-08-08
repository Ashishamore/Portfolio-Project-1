import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

/** Sticky top bar for the screens opened from the profile menu. */
export default function BackHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  /** Sits at the right of the bar — a clear-all, a count, a filter. */
  action?: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-2.5 backdrop-blur">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="-m-1 shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        {subtitle && <p className="truncate text-[10px] text-slate-500">{subtitle}</p>}
      </div>

      {action}
    </div>
  )
}
