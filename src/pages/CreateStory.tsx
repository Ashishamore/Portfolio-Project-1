import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { SAMPLE_PHOTOS } from '../lib/mockData'
import StoryEditor, { type StoryDraft } from '../components/StoryEditor'

export default function CreateStory() {
  const navigate = useNavigate()
  const { createStory, currentUser } = useStore()
  const [picked, setPicked] = useState<string | null>(null)
  const [note, setNote] = useState('')

  function publish(draft: StoryDraft) {
    if (!picked) return
    createStory({ image: picked, ...draft })
    navigate('/story')
  }

  if (picked) {
    return (
      <StoryEditor
        image={picked}
        authorName={currentUser.name}
        authorGradient={currentUser.gradient}
        onBack={() => setPicked(null)}
        onPublish={publish}
      />
    )
  }

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          to="/create"
          aria-label="Close"
          className="rounded-lg p-1 text-white transition hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold text-white">Add to story</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-1 pb-2 text-xs font-semibold text-slate-300">Recents</p>

        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setNote('Camera capture is not available in this preview — pick from Recents.')}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-sm bg-white/10 text-slate-300 transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8.5h3l1.5-2.5h8L17.5 8.5h3v11h-17v-11Z" />
              <circle cx="12" cy="13.5" r="3.5" />
            </svg>
            <span className="text-[10px] font-medium">Camera</span>
          </button>

          {SAMPLE_PHOTOS.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setPicked(photo.src)}
              className="aspect-square overflow-hidden rounded-sm transition hover:opacity-80"
            >
              <img src={photo.src} alt={photo.label} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        {note && <p className="mt-3 px-1 text-[11px] text-slate-400">{note}</p>}
      </div>
    </div>
  )
}
