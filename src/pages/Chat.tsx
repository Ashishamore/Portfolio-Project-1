import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { timeAgo } from '../lib/date'
import { Avatar, Chip } from '../components/ui'
import type { Photographer } from '../lib/types'

type Filter = 'all' | 'unread' | 'events' | 'people'

function emptyMessage(filter: Filter, searching: boolean): string {
  if (searching) return 'No chats match that search.'
  if (filter === 'unread') return 'No unread chats.'
  if (filter === 'events') return 'No assignment chats yet.'
  if (filter === 'people') return 'No one-to-one chats yet.'
  return 'No chats match that search.'
}

/** Stands in for a person's avatar on an assignment's group chat row. */
function GroupAvatar() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/15 text-indigo-300">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17" />
      </svg>
    </span>
  )
}

export default function Chat() {
  const { conversations, getPhotographer, getAssignment } = useStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0)

  /**
   * Everything that belongs in the list, before filters. Rows carry their
   * resolved title so search can match on the name as well as message text. An
   * assignment's group chat is listed from the moment the assignment exists; a
   * one-to-one thread only once something has been said.
   */
  const visible = useMemo(() => {
    return conversations
      .flatMap((c) => {
        const last = c.messages[c.messages.length - 1]

        let title: string
        let photographer: Photographer | undefined
        let memberCount = 0

        if (c.kind === 'direct') {
          photographer = getPhotographer(c.photographerId)
          if (!photographer || !last) return []
          title = photographer.name
        } else {
          const assignment = getAssignment(c.assignmentId)
          if (!assignment) return []
          title = assignment.name
          memberCount = assignment.participantIds.length + 1
        }

        return [{ conversation: c, title, photographer, last, memberCount }]
      })
      // Newest first. A group with nothing said yet was only just created, so it
      // sorts to the top rather than falling to the bottom.
      .sort((a, x) => (a.last?.minutesAgo ?? -1) - (x.last?.minutesAgo ?? -1))
  }, [conversations, getPhotographer, getAssignment])

  const eventCount = visible.filter((r) => r.conversation.kind === 'assignment').length
  const peopleCount = visible.length - eventCount

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()

    return visible.filter(({ conversation: c, title }) => {
      if (filter === 'unread' && c.unread === 0) return false
      if (filter === 'events' && c.kind !== 'assignment') return false
      if (filter === 'people' && c.kind !== 'direct') return false
      if (q && !title.toLowerCase().includes(q) && !c.messages.some((m) => m.text.toLowerCase().includes(q))) {
        return false
      }
      return true
    })
  }, [visible, query, filter])

  const listedCount = rows.length

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-10 bg-slate-950/95 px-5 pb-3 pt-3 backdrop-blur">
        <h1 className="text-xl font-semibold text-white">Chats</h1>
        <p className="mt-0.5 text-xs text-slate-400">
          {listedCount} {listedCount === 1 ? 'conversation' : 'conversations'}
          {unreadTotal > 0 && ` · ${unreadTotal} unread`}
        </p>

        <div className="relative mt-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m16.5 16.5 4 4" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          <Chip active={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread{unreadTotal > 0 && ` (${unreadTotal})`}
          </Chip>
          <Chip active={filter === 'events'} onClick={() => setFilter('events')}>
            Events ({eventCount})
          </Chip>
          <Chip active={filter === 'people'} onClick={() => setFilter('people')}>
            People ({peopleCount})
          </Chip>
        </div>
      </div>

      <div className="px-5 pt-1">
        {rows.map(({ conversation: c, title, photographer: p, last, memberCount }) => (
          <Link
            key={c.id}
            to={`/chat/${c.id}`}
            className="flex items-center gap-3 border-b border-white/5 py-3 transition hover:bg-white/5"
          >
            {p ? <Avatar name={p.name} gradient={p.gradient} image={p.avatar} /> : <GroupAvatar />}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <p className="truncate text-sm font-semibold text-white">{title}</p>
                <span className="ml-auto shrink-0 text-[10px] text-slate-500">
                  {last ? timeAgo(last.minutesAgo) : `${memberCount} members`}
                </span>
              </div>
              <p
                className={`mt-0.5 truncate text-xs ${
                  c.unread > 0 ? 'font-medium text-slate-200' : 'text-slate-400'
                }`}
              >
                {last ? (
                  <>
                    {last.from === 'me' && <span className="text-slate-500">You: </span>}
                    {last.text}
                  </>
                ) : (
                  <span className="text-slate-500">Assignment group · no messages yet</span>
                )}
              </p>
            </div>

            {c.unread > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                {c.unread > 9 ? '9+' : c.unread}
              </span>
            )}
          </Link>
        ))}

        {rows.length === 0 && (
          <div className="py-16 text-center">
            {conversations.length === 0 ? (
              <>
                <p className="text-sm text-slate-400">No conversations yet.</p>
                <Link to="/" className="mt-2 inline-block text-xs font-semibold text-indigo-400">
                  Find a photographer
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">{emptyMessage(filter, Boolean(query))}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
