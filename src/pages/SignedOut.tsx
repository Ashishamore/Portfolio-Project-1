import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'

/** Where logging out lands. The session is over; signing back in starts a fresh one. */
export default function SignedOut() {
  const { currentUser } = useStore()

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl"
        aria-hidden
      >
        👋
      </span>

      <h1 className="mt-4 text-lg font-semibold text-white">You are logged out</h1>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        The session ended and everything from it has been cleared from this device.
      </p>

      <Link
        to="/"
        className="mt-6 w-full max-w-[220px] rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        Log back in
      </Link>
      <p className="mt-2 text-[10px] text-slate-600">as {currentUser.handle}</p>
    </div>
  )
}
