import { useEffect, useRef, useState } from 'react'
import { directionsUrlFor, embedUrlFor, placeUrlFor } from '../lib/maps'
import { PinIcon } from './ui'

/** What the last Share attempt left behind, shown for a moment under the buttons. */
type Feedback = 'copied' | 'failed'

/**
 * Where the shoot is, the way a maps app shows it: a pinned preview of the spot
 * that opens Google Maps, with directions and a shareable link beside it.
 * The preview does not pan or zoom — a map inside a scrolling page would trap
 * the scroll, so tapping it hands the location to Maps instead.
 */
export default function LocationCard({
  location,
  name,
  mapUrl,
}: {
  location: string
  name: string
  /** A Maps link the owner pinned, which outranks searching for the text. */
  mapUrl?: string
}) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const place = location.trim()

  if (!place) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-slate-500">
        <PinIcon className="h-4 w-4 shrink-0" />
        No location set for this assignment yet.
      </p>
    )
  }

  function flash(kind: Feedback) {
    setFeedback(kind)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFeedback(null), 2400)
  }

  async function share() {
    const url = placeUrlFor(place, mapUrl)

    // The share sheet where the device has one — the crew is most likely being
    // sent this from a phone, into whichever app they already talk in.
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `${name} · ${place}`, url })
        return
      } catch (err) {
        // Dismissing the sheet is a decision, not a failure to fall back from.
        if ((err as Error).name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      flash('copied')
    } catch {
      flash('failed')
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="relative h-40 bg-slate-800">
        {/* Sits under the map, so a blocked or slow embed still reads as a place. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-600">
          <PinIcon className="h-7 w-7" />
          <span className="text-[10px] font-medium">Loading map…</span>
        </div>

        <iframe
          key={`${place}|${mapUrl ?? ''}`}
          title={`Map showing ${place}`}
          src={embedUrlFor(place, mapUrl)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
        />

        <a
          href={placeUrlFor(place, mapUrl)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${place} in Google Maps`}
          className="absolute inset-0 flex items-start justify-end p-2 transition hover:bg-slate-950/10"
        >
          <span className="flex items-center gap-1 rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
            Open in Maps
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-3 w-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16 16 8m0 0h-6m6 0v6" />
            </svg>
          </span>
        </a>
      </div>

      <div className="space-y-3 p-3.5">
        <p className="flex items-start gap-2">
          <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span className="min-w-0">
            <span className="block text-sm font-medium leading-snug text-white">{place}</span>
            {/* A pinned link is worth calling out: it means this is the exact spot
                the owner chose, not a search for the words above. */}
            <span className="block text-[11px] text-slate-500">
              {mapUrl?.trim() ? 'Pinned by the owner' : 'Shoot location'}
            </span>
          </span>
        </p>

        <div className="flex gap-2">
          <a
            href={directionsUrlFor(place, mapUrl)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-500 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M12 2.5 20 20.5l-8-3.6-8 3.6z" />
            </svg>
            Directions
          </a>

          <button
            type="button"
            onClick={share}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="h-4 w-4">
              <circle cx="18" cy="5.5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="18.5" r="2.5" />
              <path strokeLinecap="round" d="m8.2 10.8 7.6-3.7m-7.6 6.1 7.6 3.7" />
            </svg>
            Share
          </button>
        </div>

        {feedback && (
          <p role="status" className="text-[11px] text-slate-400">
            {feedback === 'copied'
              ? '✅ Map link copied — paste it anywhere.'
              : '⚠️ Could not copy the link. Open the map and share it from there.'}
          </p>
        )}
      </div>
    </section>
  )
}
