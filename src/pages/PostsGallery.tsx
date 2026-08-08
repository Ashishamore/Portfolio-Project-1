import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import PostCard from '../components/PostCard'

type View = 'grid' | 'feed'

/** Every photo a photographer has posted. Reached from "See all" on their profile. */
export default function PostsGallery({ own = false }: { own?: boolean }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { posts, currentUser, getPhotographer } = useStore()

  // `?post=<id>` lands straight in the feed on that photo — profile tiles link in that way.
  const requestedId = searchParams.get('post')
  const [view, setView] = useState<View>(requestedId ? 'feed' : 'grid')
  // The post the feed still has to scroll to; cleared once it has been placed.
  const [pendingId, setPendingId] = useState<string | null>(requestedId)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef(new Map<string, HTMLDivElement>())

  const photographer = own ? currentUser : id ? getPhotographer(id) : undefined

  // The feed is stored newest first, so filtering keeps the gallery in that order.
  const gallery = useMemo(
    () => (photographer ? posts.filter((p) => p.photographerId === photographer.id) : []),
    [posts, photographer],
  )

  // Jump to the opened post before paint, so the earlier posts sit above it and the
  // later ones below without the feed ever flashing at the top.
  useLayoutEffect(() => {
    if (view !== 'feed' || !pendingId) return
    const scroller = scrollerRef.current
    const card = cardRefs.current.get(pendingId)
    if (scroller && card) {
      const offset =
        card.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        (headerRef.current?.offsetHeight ?? 0)
      scroller.scrollTop = Math.max(offset, 0)
    }
    setPendingId(null)
  }, [view, pendingId])

  /** Tapping a tile hands off to the feed, anchored on that photo. */
  const openInFeed = (postId: string) => {
    setView('feed')
    setPendingId(postId)
  }

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
      <div ref={scrollerRef} className="h-full overflow-y-auto pb-6">
        <div
          ref={headerRef}
          className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-2.5 backdrop-blur"
        >
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
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {own ? 'Your posts' : photographer.name}
            </p>
            <p className="text-[10px] text-slate-500">
              {gallery.length} {gallery.length === 1 ? 'post' : 'posts'}
            </p>
          </div>

          {gallery.length > 0 && (
            <div className="flex shrink-0 gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5">
              <ViewToggle label="Grid view" active={view === 'grid'} onClick={() => setView('grid')}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <rect x="3" y="3" width="7.5" height="7.5" rx="1.4" />
                  <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.4" />
                  <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.4" />
                  <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.4" />
                </svg>
              </ViewToggle>
              <ViewToggle label="Feed view" active={view === 'feed'} onClick={() => setView('feed')}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <rect x="3" y="3" width="18" height="8" rx="1.6" />
                  <rect x="3" y="13" width="18" height="8" rx="1.6" />
                </svg>
              </ViewToggle>
            </div>
          )}
        </div>

        {gallery.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-sm text-slate-400">
              {own ? 'You have not posted a photo yet.' : `${photographer.name} has not posted yet.`}
            </p>
            {own && (
              <Link
                to="/create/post"
                className="mt-3 inline-block rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                Share a photo
              </Link>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {gallery.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => openInFeed(post.id)}
                aria-label={`Open ${post.alt} in the feed`}
                className="aspect-square overflow-hidden bg-white/5 transition hover:opacity-80"
              >
                <img src={post.image} alt={post.alt} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        ) : (
          // The same cards the home feed uses, so likes and saves stay in sync.
          <div>
            {gallery.map((post) => (
              <div
                key={post.id}
                ref={(node) => {
                  if (node) cardRefs.current.set(post.id, node)
                  else cardRefs.current.delete(post.id)
                }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ViewToggle({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`rounded-md p-1.5 transition ${
        active ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
