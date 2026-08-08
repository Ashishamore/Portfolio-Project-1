import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { timeAgo } from '../lib/date'
import { Avatar } from '../components/ui'

export default function StoryViewer() {
  const navigate = useNavigate()
  const { stories, currentUser } = useStore()
  const [index, setIndex] = useState(0)

  const story = stories[index]

  if (!story) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-5">
        <p className="text-sm text-slate-400">No active stories.</p>
        <Link to="/create/story" className="text-xs font-semibold text-indigo-400">
          Add one
        </Link>
      </div>
    )
  }

  function advance() {
    if (index + 1 < stories.length) setIndex(index + 1)
    else navigate('/')
  }

  return (
    <div className="relative h-full bg-black">
      <img src={story.image} alt="" className="h-full w-full object-cover" />

      {story.drawing && (
        <img src={story.drawing} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />
      )}

      {story.overlays.map((o) => (
        <span
          key={o.id}
          style={{
            left: `${o.x}%`,
            top: `${o.y}%`,
            color: o.color,
            fontSize: `${o.size}px`,
            textShadow: o.kind === 'text' ? '0 1px 6px rgba(0,0,0,0.45)' : undefined,
          }}
          className="pointer-events-none absolute max-w-[80%] -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap break-words text-center font-bold leading-tight"
        >
          {o.value}
        </span>
      ))}

      {/* One segment per story, filled up to the one being viewed. */}
      <div className="absolute inset-x-3 top-3 flex gap-1">
        {stories.map((s, i) => (
          <span
            key={s.id}
            className={`h-0.5 flex-1 rounded-full ${i <= index ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>

      <div className="absolute inset-x-3 top-6 flex items-center gap-2.5">
        <Avatar name={currentUser.name} gradient={currentUser.gradient} image={currentUser.avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-white">
            Your story
            {story.audience === 'closeFriends' && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[9px]">
                ★
              </span>
            )}
          </p>
          <p className="text-[10px] text-white/70">{timeAgo(story.minutesAgo)}</p>
        </div>
        <Link
          to="/"
          aria-label="Close story"
          className="rounded-lg p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
      </div>

      {/* Tap anywhere to move on, the way a story deck behaves. */}
      <button
        type="button"
        onClick={advance}
        aria-label="Next story"
        className="absolute inset-0 top-16 w-full cursor-default"
      />
    </div>
  )
}
