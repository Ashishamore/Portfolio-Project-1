import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { formatDate } from '../lib/date'

export default function AddToAssignmentSheet({
  photographerId,
  photographerName,
  onClose,
}: {
  photographerId: string
  photographerName: string
  onClose: () => void
}) {
  const { assignments, currentUser, addParticipant, removeParticipant } = useStore()
  // You can only staff assignments you run, not ones you were invited onto.
  const ownAssignments = assignments.filter((a) => a.ownerId === currentUser.id)

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative max-h-[75%] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-900 pb-5">
        <div className="sticky top-0 bg-slate-900 px-5 pb-3 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <h2 className="text-sm font-semibold text-white">Add to assignment</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">Adding {photographerName}</p>
        </div>

        <div className="space-y-2 px-5">
          {ownAssignments.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-500">
              You have no assignments of your own yet.
            </p>
          )}

          {ownAssignments.map((a) => {
            const added = a.participantIds.includes(photographerId)
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{a.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {a.location} · {formatDate(a.startDate)} · {a.durationDays}d
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    added ? removeParticipant(a.id, photographerId) : addParticipant(a.id, photographerId)
                  }
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                    added
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-indigo-500 text-white hover:bg-indigo-400'
                  }`}
                >
                  {added ? 'Added' : 'Add'}
                </button>
              </div>
            )
          })}

          <Link
            to="/create"
            onClick={onClose}
            className="block rounded-xl border border-dashed border-white/15 py-3 text-center text-xs font-medium text-slate-400 transition hover:border-white/30 hover:text-white"
          >
            + Create a new assignment
          </Link>
        </div>
      </div>
    </div>
  )
}
