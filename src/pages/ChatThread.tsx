import { Link, useParams } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { Avatar } from '../components/ui'
import ChatPanel from '../components/ChatPanel'

export default function ChatThread() {
  const { id = '' } = useParams()
  const { getConversation, getPhotographer, getAssignment } = useStore()

  const conversation = getConversation(id)
  const photographer =
    conversation?.kind === 'direct' ? getPhotographer(conversation.photographerId) : undefined
  const assignment =
    conversation?.kind === 'assignment' ? getAssignment(conversation.assignmentId) : undefined

  if (!conversation || (!photographer && !assignment)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-5">
        <p className="text-sm text-slate-400">Conversation not found.</p>
        <Link to="/chat" className="text-xs font-semibold text-indigo-400">
          Back to chats
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950/95 px-4 py-2.5 backdrop-blur">
        <Link
          to="/chat"
          aria-label="Back to chats"
          className="shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 5-7 7 7 7" />
          </svg>
        </Link>

        {/* The header doubles as the way into the profile, or the assignment. */}
        {photographer && (
          <Link to={`/photographer/${photographer.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar name={photographer.name} gradient={photographer.gradient} image={photographer.avatar} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">{photographer.name}</p>
              <p className="truncate text-[10px] text-slate-400">Responds in {photographer.respondsIn}</p>
            </div>
          </Link>
        )}

        {assignment && (
          <Link to={`/assignment/${assignment.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/15 text-indigo-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
                <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                <path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">{assignment.name}</p>
              <p className="truncate text-[10px] text-slate-400">
                Assignment group · {assignment.participantIds.length + 1} members
              </p>
            </div>
          </Link>
        )}
      </div>

      <ChatPanel
        conversationId={conversation.id}
        placeholder={photographer ? `Message ${photographer.name.split(' ')[0]}` : 'Message the group'}
        emptyState={
          <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
            {photographer && (
              <>
                <Avatar name={photographer.name} gradient={photographer.gradient} image={photographer.avatar} size="md" />
                <p className="text-xs text-slate-400">
                  This is the start of your conversation with {photographer.name.split(' ')[0]}.
                </p>
                <p className="text-[10px] text-slate-600">Responds in {photographer.respondsIn}</p>
              </>
            )}
            {assignment && (
              <>
                <p className="text-xs text-slate-400">This is the group chat for {assignment.name}.</p>
                <p className="text-[10px] text-slate-600">
                  Everyone on the assignment can see what is posted here.
                </p>
              </>
            )}
          </div>
        }
      />
    </div>
  )
}
