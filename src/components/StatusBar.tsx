import { useEffect, useState } from 'react'

function currentTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(/\s?[AP]M$/i, '')
}

/** Fixed height so overlays can offset themselves by exactly this much. */
export const STATUS_BAR_HEIGHT = 'h-9'

export default function StatusBar() {
  const [time, setTime] = useState(currentTime)

  useEffect(() => {
    const id = setInterval(() => setTime(currentTime()), 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    // z-50 keeps it above the search overlay and bottom sheets, so it never gets covered.
    <div className={`relative z-50 flex ${STATUS_BAR_HEIGHT} shrink-0 items-center justify-between border-b border-white/5 bg-white/10 px-6 text-white backdrop-blur-md`}>
      <span className="text-[13px] font-semibold tabular-nums tracking-tight">{time}</span>

      <Notch />

      <div className="flex items-center gap-1.5">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}

/**
 * The cutout hanging from the top edge: earpiece grille and front camera, with a
 * concave fillet either side where the black meets the screen, the way glass does.
 *
 * Part of the mocked handset, so it appears only where the phone frame does. On a
 * real phone the device draws its own — a second one under it would be nonsense.
 */
function Notch() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden justify-center lg:flex"
    >
      <Fillet side="left" />

      <div className="flex h-7 w-[150px] items-center justify-center gap-2.5 rounded-b-[1.1rem] bg-black">
        {/* Earpiece: a recessed slot, lit along its top lip. */}
        <span className="h-[5px] w-11 rounded-full bg-[linear-gradient(180deg,#26272d_0%,#0b0c0f_55%,#17181d_100%)] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.16)]" />

        {/* Front camera: dark glass with an off-centre catchlight. */}
        <span className="relative h-[9px] w-[9px] rounded-full bg-[radial-gradient(circle_at_34%_30%,#454a58_0%,#15171d_58%,#04050a_100%)] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.18)]">
          <span className="absolute left-[1.5px] top-[1.5px] h-[2px] w-[2px] rounded-full bg-white/45" />
        </span>
      </div>

      <Fillet side="right" />
    </div>
  )
}

/** The curve that eases the notch back into the top edge. */
function Fillet({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      className="h-3 w-3 shrink-0"
      style={{
        background: `radial-gradient(circle at ${side === 'left' ? '0% 100%' : '100% 100%'}, transparent 11.5px, #000 12px)`,
      }}
    />
  )
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 18 12" className="h-3 w-[18px] fill-current" aria-hidden>
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 16 12" className="h-3 w-4 fill-current" aria-hidden>
      <path d="M8 11.2 6.1 9.1a2.9 2.9 0 0 1 3.8 0z" />
      <path
        d="M8 5.6c1.4 0 2.7.5 3.6 1.4l1.3-1.4A7 7 0 0 0 8 3.7a7 7 0 0 0-4.9 1.9l1.3 1.4A5.2 5.2 0 0 1 8 5.6z"
        opacity=".9"
      />
      <path d="M8 1.8c2 0 3.9.7 5.3 2l1.3-1.4A9.4 9.4 0 0 0 8 0a9.4 9.4 0 0 0-6.6 2.4l1.3 1.4A7.6 7.6 0 0 1 8 1.8z" opacity=".9" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 27 12" className="h-3 w-[27px]" aria-hidden>
      <rect x="0.5" y="0.5" width="22" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".4" />
      <rect x="2" y="2" width="16" height="8" rx="2" className="fill-current" />
      <path d="M24.5 4v4a2.1 2.1 0 0 0 0-4z" className="fill-current" opacity=".4" />
    </svg>
  )
}
