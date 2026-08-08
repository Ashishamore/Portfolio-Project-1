import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import ProfileView from '../components/ProfileView'
import AddToAssignmentSheet from '../components/AddToAssignmentSheet'

export default function PhotographerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPhotographer, openConversationWith } = useStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const photographer = id ? getPhotographer(id) : undefined

  if (!photographer) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-slate-400">That photographer could not be found.</p>
        <Link to="/" className="text-xs font-semibold text-indigo-400">
          Back to search
        </Link>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-20">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-2.5 backdrop-blur">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="-m-1 rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <span className="text-xs font-semibold text-white">Profile</span>
        </div>

        <ProfileView photographer={photographer} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex gap-2 border-t border-white/10 bg-slate-950/95 px-5 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate(`/chat/${openConversationWith(photographer.id)}`)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ChatIcon />
          Message
        </button>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="min-w-0 flex-1 truncate rounded-xl bg-indigo-500 px-3 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Add to assignment
        </button>
      </div>

      {sheetOpen && (
        <AddToAssignmentSheet
          photographerId={photographer.id}
          photographerName={photographer.name}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12a7.5 7.5 0 0 1-7.5 7.5c-1.2 0-2.3-.28-3.3-.78L4.5 20l1.3-4.4A7.5 7.5 0 1 1 20 12Z"
      />
    </svg>
  )
}
