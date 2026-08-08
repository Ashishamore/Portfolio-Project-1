import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import ProfileView from '../components/ProfileView'
import { IconButton } from '../components/ui'

export default function Profile() {
  const { currentUser } = useStore()
  const navigate = useNavigate()

  return (
    <div>
      {/* Titled like the other root tabs — Chats, Create, Schedule — rather than
          like a photographer's profile, which keeps a compact bar for its back arrow.
          The actions on your own profile ride along in this bar. */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-white/10 bg-slate-950/95 px-5 pb-3 pt-3 backdrop-blur">
        <h1 className="min-w-0 flex-1 truncate text-xl font-semibold text-white">Profile</h1>

        <div className="flex shrink-0 items-center gap-1.5">
          <IconButton label="Edit profile" onClick={() => navigate('/profile/edit')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 20h4l10-10a2.6 2.6 0 0 0-3.7-3.7L4.3 16.3 4 20Z"
              />
              <path strokeLinecap="round" d="m13.8 7.2 3 3" />
            </svg>
          </IconButton>

          <IconButton label="Share profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <circle cx="18" cy="5.5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="18.5" r="2.5" />
              <path strokeLinecap="round" d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4" />
            </svg>
          </IconButton>

          <IconButton label="Menu" onClick={() => navigate('/menu')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </IconButton>
        </div>
      </div>

      <ProfileView photographer={currentUser} isOwn />
    </div>
  )
}
