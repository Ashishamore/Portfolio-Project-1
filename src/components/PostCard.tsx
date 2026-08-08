import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { formatDate } from '../lib/date'
import { Avatar } from '../components/ui'
import type { Post } from '../lib/types'

/** Characters of caption shown before the "More" toggle takes over. */
const CAPTION_PREVIEW = 110

export default function PostCard({ post }: { post: Post }) {
  const {
    getPhotographer,
    followingIds,
    toggleFollowing,
    likedPostIds,
    savedPostIds,
    toggleLikedPost,
    toggleSavedPost,
  } = useStore()
  const [expanded, setExpanded] = useState(false)

  const photographer = getPhotographer(post.photographerId)
  if (!photographer) return null

  const following = followingIds.includes(photographer.id)
  const liked = likedPostIds.includes(post.id)
  const saved = savedPostIds.includes(post.id)
  // The seeded count excludes the signed-in user, so a like adds one on top.
  const likes = post.likes + (liked ? 1 : 0)
  const clipped = !expanded && post.caption.length > CAPTION_PREVIEW

  return (
    <article className="border-b border-white/10 pb-1">
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <Link to={`/photographer/${photographer.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar name={photographer.name} gradient={photographer.gradient} image={photographer.avatar} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white">{photographer.name}</p>
            <p className="truncate text-[10px] text-slate-400">{photographer.city}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => toggleFollowing(photographer.id)}
          className={`shrink-0 rounded-lg border px-3 py-1 text-[11px] font-semibold transition ${
            following
              ? 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
              : 'border-white/25 text-white hover:bg-white/10'
          }`}
        >
          {following ? 'Following' : 'Follow'}
        </button>

        <button
          type="button"
          aria-label="Post options"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <circle cx="12" cy="5" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="12" cy="19" r="1.6" />
          </svg>
        </button>
      </div>

      <img
        src={post.image}
        alt={post.alt}
        loading="lazy"
        className="aspect-square w-full bg-white/5 object-cover"
      />

      <div className="px-4 pb-3 pt-2.5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => toggleLikedPost(post.id)}
            aria-label={liked ? 'Unlike post' : 'Like post'}
            aria-pressed={liked}
            className={`transition ${liked ? 'text-rose-500' : 'text-slate-300 hover:text-white'}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.7}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Comment"
            className="text-slate-300 transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 12c0 3.9-3.6 7-8 7a9 9 0 0 1-2.6-.38L5 20l1.2-3.3A6.6 6.6 0 0 1 4 12c0-3.9 3.6-7 8-7s8 3.1 8 7Z"
              />
            </svg>
          </button>

          <button type="button" aria-label="Share" className="text-slate-300 transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-6 w-6">
              <circle cx="18" cy="5.5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="18.5" r="2.5" />
              <path strokeLinecap="round" d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => toggleSavedPost(post.id)}
            aria-label={saved ? 'Remove from saved' : 'Save post'}
            aria-pressed={saved}
            className={`ml-auto transition ${saved ? 'text-white' : 'text-slate-300 hover:text-white'}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={saved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.7}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 4h11v16l-5.5-4-5.5 4V4Z" />
            </svg>
          </button>
        </div>

        <p className="mt-2.5 text-sm font-semibold text-white">{likes.toLocaleString('en-IN')} likes</p>

        <p className="mt-1 text-xs leading-relaxed text-slate-300">
          {clipped ? `${post.caption.slice(0, CAPTION_PREVIEW).trimEnd()}…` : post.caption}
          {post.caption.length > CAPTION_PREVIEW && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="ml-1 font-medium text-slate-500 transition hover:text-slate-300"
            >
              {expanded ? 'less' : 'More'}
            </button>
          )}
        </p>

        <p className="mt-1.5 text-xs text-slate-400">View all {post.comments} comments</p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">{formatDate(post.postedOn)}</p>
      </div>
    </article>
  )
}
