import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import PostCard from '../components/PostCard'
import UpcomingAssignments from '../components/UpcomingAssignments'
import type { Photographer } from '../lib/types'
import { Avatar, PinIcon, ProficiencyBadge } from '../components/ui'

export default function Home() {
  const {
    conversations,
    getPhotographer,
    currentUser,
    posts,
    stories,
    openSearch,
    unreadNotificationCount,
  } = useStore()
  const hasStory = stories.length > 0

  // The rail is a preview of the chat tab: 6 most recent people. Assignment group
  // chats are not people, so they stay in the chat tab.
  const recentChats = conversations
    .filter((c) => c.kind === 'direct')
    .slice(0, 6)
    .map((c) => ({ conversation: c, photographer: getPhotographer(c.photographerId) }))
    .filter((row): row is typeof row & { photographer: Photographer } => Boolean(row.photographer))

  return (
    <div className="pb-4">
      <div className="px-5 pb-1 pt-3">
        <div className="flex items-center gap-3">
          {/* A live story turns the avatar into its entry point, ring and all. */}
          <Link
            to={hasStory ? '/story' : '/create/story'}
            aria-label={hasStory ? 'View your story' : 'Add a story'}
            className={`shrink-0 rounded-full ${
              hasStory ? 'bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]' : ''
            }`}
          >
            <span className={`block rounded-full ${hasStory ? 'bg-slate-950 p-[2px]' : ''}`}>
              <Avatar name={currentUser.name} gradient={currentUser.gradient} image={currentUser.avatar} />
            </span>
          </Link>

          <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">Welcome back</p>
              <h1 className="truncate text-lg font-semibold leading-tight text-white">{currentUser.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <PinIcon />
                  {currentUser.city}, {currentUser.state}
                </span>
                <ProficiencyBadge level={currentUser.proficiency} />
              </div>
            </div>
          </Link>

          <Link
            to="/notifications"
            aria-label={
              unreadNotificationCount > 0
                ? `Notifications, ${unreadNotificationCount} unread`
                : 'Notifications'
            }
            className="relative shrink-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 18a2 2 0 0 0 4 0" />
            </svg>
            {unreadNotificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-slate-950/95 px-5 pb-3 pt-3 backdrop-blur">
        <h2 className="text-sm font-semibold text-white">Find a photographer</h2>

        {/* Opens the full-screen universal search rather than filtering in place. */}
        <button
          type="button"
          onClick={openSearch}
          className="mt-2.5 flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-4 w-4 shrink-0 text-slate-500"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m16.5 16.5 4 4" />
          </svg>
          <span className="text-sm text-slate-500">Search people, assignments, places</span>
        </button>

      </div>

      {/* Owns its own gutters — the rail bleeds past them so cards run off the edge. */}
      <UpcomingAssignments />

      <div className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent chats</h2>
          <Link
            to="/chat"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            See all
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Bleeds past the page gutter so tiles slide under the screen edge: w-16 + gap-5 leaves
            the 5th avatar half-cut at rest, and scrolling reveals the 6th in full. */}
        <div className="-mx-5 mt-3 flex snap-x gap-5 overflow-x-auto scroll-px-5 px-5 pb-1">
          {recentChats.map(({ conversation, photographer }) => (
            <Link
              key={conversation.id}
              to={`/chat/${conversation.id}`}
              className="flex w-16 shrink-0 snap-start flex-col items-center gap-1.5 transition hover:opacity-80"
            >
              <span className="relative">
                <Avatar name={photographer.name} gradient={photographer.gradient} image={photographer.avatar} />
                {conversation.unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {conversation.unread > 9 ? '9+' : conversation.unread}
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-[11px] text-slate-400">
                {photographer.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Posts run edge to edge, so the feed sits outside the page gutter. */}
      <div className="mt-4 border-t border-white/10">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
