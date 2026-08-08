import { NavLink } from 'react-router-dom'
import { useStore } from '../lib/storeContext'

const TABS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/chat', label: 'Chat', icon: ChatIcon },
  { to: '/create', label: 'Create', icon: CreateIcon },
  { to: '/schedule', label: 'Schedule', icon: ScheduleIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
]

export default function BottomNav() {
  const { conversations } = useStore()
  const unreadChats = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <nav className="flex shrink-0 items-stretch border-t border-white/10 bg-slate-950/95 backdrop-blur">
      {TABS.map(({ to, label, icon: Icon }) => {
        const badge = to === '/chat' ? unreadChats : 0

        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            // Screen readers get the count too, since the badge alone is only visual.
            aria-label={badge > 0 ? `${label}, ${badge} unread` : undefined}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon active={isActive} />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-500 px-1 text-[9px] font-bold leading-none text-white">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V21h14V9.5" />
    </svg>
  )
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12c0 3.9-3.6 7-8 7a9 9 0 0 1-2.6-.38L5 20l1.2-3.3A6.6 6.6 0 0 1 4 12c0-3.9 3.6-7 8-7s8 3.1 8 7Z"
      />
    </svg>
  )
}

function CreateIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} stroke="currentColor">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5v7M8.5 12h7" />
    </svg>
  )
}

function ScheduleIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} stroke="currentColor">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10h17M8.5 3.5V6.5M15.5 3.5V6.5" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} stroke="currentColor">
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" />
    </svg>
  )
}
