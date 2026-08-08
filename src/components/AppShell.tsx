import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import StatusBar from './StatusBar'
import Home from '../pages/Home'
import Notifications from '../pages/Notifications'
import Chat from '../pages/Chat'
import ChatThread from '../pages/ChatThread'
import Create from '../pages/Create'
import CreateStory from '../pages/CreateStory'
import CreatePost from '../pages/CreatePost'
import CreateAssignment from '../pages/CreateAssignment'
import StoryViewer from '../pages/StoryViewer'
import Schedule from '../pages/Schedule'
import AssignmentDetail from '../pages/AssignmentDetail'
import Profile from '../pages/Profile'
import EditProfile from '../pages/EditProfile'
import AccountMenu from '../pages/AccountMenu'
import SavedItems from '../pages/SavedItems'
import ActivityLog from '../pages/ActivityLog'
import NotificationSettings from '../pages/NotificationSettings'
import PrivacySettings from '../pages/PrivacySettings'
import Verification from '../pages/Verification'
import SignedOut from '../pages/SignedOut'
import PhotographerDetail from '../pages/PhotographerDetail'
import PostsGallery from '../pages/PostsGallery'
import SearchOverlay from './SearchOverlay'
import { useStore } from '../lib/storeContext'

export default function AppShell() {
  const { pathname } = useLocation()
  const { searchOpen } = useStore()
  // These views own their own scrolling so sticky bars, sheets and the chat composer anchor correctly.
  const fullBleed =
    pathname.startsWith('/photographer/') ||
    pathname.startsWith('/assignment/') ||
    pathname.startsWith('/chat/') ||
    pathname.startsWith('/create') ||
    pathname === '/story' ||
    pathname === '/profile/posts' ||
    pathname === '/profile/edit' ||
    pathname === '/menu' ||
    pathname === '/saved' ||
    pathname === '/activity' ||
    pathname === '/signed-out' ||
    pathname.startsWith('/settings')

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <StatusBar />

      <div className={fullBleed ? 'min-h-0 flex-1' : 'min-h-0 flex-1 overflow-y-auto'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<ChatThread />} />
          <Route path="/create" element={<Create />} />
          <Route path="/create/story" element={<CreateStory />} />
          <Route path="/create/post" element={<CreatePost />} />
          <Route path="/create/assignment" element={<CreateAssignment />} />
          <Route path="/story" element={<StoryViewer />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/assignment/:id" element={<AssignmentDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/menu" element={<AccountMenu />} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/settings/verification" element={<Verification />} />
          <Route path="/signed-out" element={<SignedOut />} />
          <Route path="/profile/posts" element={<PostsGallery own />} />
          <Route path="/photographer/:id" element={<PhotographerDetail />} />
          <Route path="/photographer/:id/posts" element={<PostsGallery />} />
        </Routes>
      </div>

      <BottomNav />

      {searchOpen && <SearchOverlay />}
    </div>
  )
}
