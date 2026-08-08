import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import BackHeader from '../components/BackHeader'
import PhotographerCard from '../components/PhotographerCard'

const TABS = [
  { key: 'photographers', label: 'Photographers' },
  { key: 'posts', label: 'Posts' },
  { key: 'liked', label: 'Liked' },
  { key: 'following', label: 'Following' },
] as const

type TabKey = (typeof TABS)[number]['key']

/** Everything the user has kept: profiles, photos, likes and follows, in one place. */
export default function SavedItems() {
  const [params, setParams] = useSearchParams()
  const { photographers, posts, savedIds, savedPostIds, likedPostIds, followingIds } = useStore()

  const requested = params.get('tab') as TabKey | null
  const tab: TabKey = TABS.some((t) => t.key === requested) ? (requested as TabKey) : 'photographers'

  const byId = useMemo(() => new Map(photographers.map((p) => [p.id, p])), [photographers])
  const list = (ids: string[]) => ids.map((id) => byId.get(id)).filter((p) => p !== undefined)
  const postList = (ids: string[]) => posts.filter((p) => ids.includes(p.id))

  const saved = list(savedIds)
  const following = list(followingIds)
  const savedPosts = postList(savedPostIds)
  const likedPosts = postList(likedPostIds)

  const counts: Record<TabKey, number> = {
    photographers: saved.length,
    posts: savedPosts.length,
    liked: likedPosts.length,
    following: following.length,
  }

  return (
    <div className="h-full overflow-y-auto pb-6">
      <BackHeader title="Saved" subtitle="Profiles and photos you kept" />

      <div className="sticky top-[49px] z-10 flex gap-1 border-b border-white/10 bg-slate-950/90 px-3 py-2 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setParams({ tab: t.key }, { replace: true })}
            aria-current={t.key === tab ? 'page' : undefined}
            className={`flex-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold transition ${
              t.key === tab
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.label}
            <span className="ml-1 text-[9px] text-slate-500">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="px-5 pt-4">
        {tab === 'photographers' &&
          (saved.length > 0 ? (
            <div className="space-y-2.5">
              {saved.map((p) => (
                <PhotographerCard key={p.id} photographer={p} />
              ))}
            </div>
          ) : (
            <Empty
              text="No saved photographers yet."
              hint="Tap the bookmark on any profile to keep it here."
            />
          ))}

        {tab === 'following' &&
          (following.length > 0 ? (
            <div className="space-y-2.5">
              {following.map((p) => (
                <PhotographerCard key={p.id} photographer={p} />
              ))}
            </div>
          ) : (
            <Empty text="You are not following anyone yet." hint="Following fills your home feed." />
          ))}

        {(tab === 'posts' || tab === 'liked') &&
          (() => {
            const gallery = tab === 'posts' ? savedPosts : likedPosts
            if (gallery.length === 0) {
              return (
                <Empty
                  text={tab === 'posts' ? 'No saved photos yet.' : 'No liked photos yet.'}
                  hint={
                    tab === 'posts'
                      ? 'Save a photo from the feed to find it here.'
                      : 'Photos you like are collected here.'
                  }
                />
              )
            }
            return (
              <div className="-mx-4 grid grid-cols-3 gap-0.5">
                {gallery.map((post) => (
                  <Link
                    key={post.id}
                    to={`/photographer/${post.photographerId}/posts?post=${post.id}`}
                    className="aspect-square overflow-hidden bg-white/5 transition hover:opacity-80"
                  >
                    <img
                      src={post.image}
                      alt={post.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            )
          })()}
      </div>
    </div>
  )
}

function Empty({ text, hint }: { text: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">
      <p className="text-xs text-slate-400">{text}</p>
      <p className="mt-1.5 text-[10px] text-slate-600">{hint}</p>
    </div>
  )
}
