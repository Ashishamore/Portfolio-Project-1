import { SAMPLE_PHOTOS } from '../lib/mockData'

/**
 * There is no upload backend, so composers pick from a bundled library instead.
 * `value` is the asset URL of the chosen photo.
 */
export default function PhotoPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (src: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SAMPLE_PHOTOS.map((photo) => {
        const selected = photo.src === value
        return (
          <button
            key={photo.id}
            type="button"
            onClick={() => onChange(photo.src)}
            aria-pressed={selected}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
              selected ? 'border-indigo-500' : 'border-transparent hover:border-white/25'
            }`}
          >
            <img src={photo.src} alt={photo.label} loading="lazy" className="h-full w-full object-cover" />
            {selected && (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
