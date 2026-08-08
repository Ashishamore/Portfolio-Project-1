import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function Create() {
  return (
    <div className="h-full overflow-y-auto px-5 pb-6 pt-3">
      <h1 className="text-xl font-semibold text-white">Create</h1>
      <p className="mt-0.5 text-xs text-slate-400">What are you putting out today?</p>

      <div className="mt-5 space-y-3">
        <Option
          to="/create/story"
          title="Story"
          description="A photo that disappears after 24 hours"
          accent="bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <circle cx="12" cy="12" r="8.5" strokeDasharray="3 2.4" />
              <path strokeLinecap="round" d="M12 8.5v7M8.5 12h7" />
            </svg>
          }
        />

        <Option
          to="/create/post"
          title="Post"
          description="A photo and caption for your feed"
          accent="bg-gradient-to-br from-sky-500 to-indigo-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
              <circle cx="9" cy="10" r="1.6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 17 4.5-4 3.5 3 3-2.5 4 3.5" />
            </svg>
          }
        />

        <Option
          to="/create/assignment"
          title="Assignment"
          description="A shoot to plan and bring people onto"
          accent="bg-gradient-to-br from-emerald-500 to-teal-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10h17M8.5 3.5V6.5M15.5 3.5V6.5" />
            </svg>
          }
        />
      </div>
    </div>
  )
}

function Option({
  to,
  title,
  description,
  accent,
  icon,
}: {
  to: string
  title: string
  description: string
  accent: string
  icon: ReactNode
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:bg-white/10"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${accent}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="block truncate text-[11px] text-slate-400">{description}</span>
      </span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-slate-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
      </svg>
    </Link>
  )
}
