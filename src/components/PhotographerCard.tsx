import { Link } from 'react-router-dom'
import type { Photographer } from '../lib/types'
import { formatINR } from '../lib/date'
import { useStore } from '../lib/storeContext'
import { Avatar, PinIcon, ProficiencyBadge, Stars } from './ui'

export default function PhotographerCard({ photographer }: { photographer: Photographer }) {
  const { savedIds, toggleSaved } = useStore()
  const isSaved = savedIds.includes(photographer.id)

  return (
    <Link
      to={`/photographer/${photographer.id}`}
      className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/[0.08]"
    >
      <Avatar name={photographer.name} gradient={photographer.gradient} image={photographer.avatar} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{photographer.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
              <PinIcon />
              {photographer.city}, {photographer.state}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggleSaved(photographer.id)
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save profile'}
            className={`-m-1 shrink-0 p-1 transition ${
              isSaved ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <svg viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" fill={isSaved ? 'currentColor' : 'none'} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v17l-6-4.2L6 21z" />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <Stars rating={photographer.rating} />
          <span>{photographer.timesHired} hires</span>
          <ProficiencyBadge level={photographer.proficiency} />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-[11px] text-slate-500">{photographer.specialties.join(' · ')}</p>
          <p className="shrink-0 text-xs font-semibold text-white">
            {formatINR(photographer.dayRate)}
            <span className="font-normal text-slate-500">/day</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
