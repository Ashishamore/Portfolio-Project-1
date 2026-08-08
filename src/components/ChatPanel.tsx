import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useStore } from '../lib/storeContext'
import { timeAgo } from '../lib/date'
import { Avatar } from './ui'

/**
 * The message list and composer for one conversation, without any page chrome.
 * Shared by the chat thread page and the assignment's Chats tab.
 */
export default function ChatPanel({
  conversationId,
  placeholder,
  emptyState,
}: {
  conversationId: string
  placeholder: string
  emptyState: React.ReactNode
}) {
  const { getConversation, getPhotographer, sendMessage, markConversationRead } = useStore()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const conversation = getConversation(conversationId)
  const isGroup = conversation?.kind === 'assignment'
  const messageCount = conversation?.messages.length ?? 0

  useEffect(() => {
    if (conversationId) markConversationRead(conversationId)
  }, [conversationId, markConversationRead])

  // Threads open at the newest message, the way a real chat does.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messageCount])

  if (!conversation) return null

  function handleSend(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    sendMessage(conversationId, text)
    setDraft('')
  }

  return (
    <>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {conversation.messages.length === 0 && emptyState}

        {conversation.messages.map((m) => {
          const mine = m.from === 'me'
          // In a group the sender matters, so their name sits above the bubble.
          const sender = isGroup && !mine ? getPhotographer(m.from) : undefined

          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[78%]">
                {sender && (
                  <div className="mb-0.5 flex items-center gap-1.5 pl-1 text-[10px] font-medium text-slate-400">
                    <Avatar name={sender.name} gradient={sender.gradient} image={sender.avatar} size="xs" />
                    <span>{sender.name}</span>
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    mine
                      ? 'rounded-br-md bg-indigo-500 text-white'
                      : 'rounded-bl-md border border-white/10 bg-white/5 text-slate-100'
                  }`}
                >
                  <p className="text-xs leading-relaxed">{m.text}</p>
                  <p className={`mt-1 text-[9px] ${mine ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {timeAgo(m.minutesAgo)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-slate-950/95 px-4 py-2.5 backdrop-blur"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label="Message"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send message"
          className="shrink-0 rounded-full bg-indigo-500 p-2.5 text-white transition hover:bg-indigo-400 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6-6m6 6-6 6" />
          </svg>
        </button>
      </form>
    </>
  )
}
