import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { SAMPLE_PHOTOS } from '../lib/mockData'
import ComposerHeader from '../components/ComposerHeader'
import PhotoPicker from '../components/PhotoPicker'

export default function CreatePost() {
  const navigate = useNavigate()
  const { createPost } = useStore()

  const [image, setImage] = useState(SAMPLE_PHOTOS[0].src)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!caption.trim()) {
      setError('Add a caption before posting.')
      return
    }

    const label = SAMPLE_PHOTOS.find((p) => p.src === image)?.label ?? 'Photo'
    createPost({ image, alt: `${label} photo posted to the feed`, caption: caption.trim() })
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-y-auto pb-6">
      <ComposerHeader title="New post" subtitle="Pick a photo, write a caption" />

      <div className="px-5 pt-4">
        <img src={image} alt="" className="aspect-square w-full rounded-2xl bg-white/5 object-cover" />

        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Photo</p>
        <PhotoPicker value={image} onChange={setImage} />

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Caption
          </span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder="Where it was shot, how it came together…"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
          />
        </label>

        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Share post
        </button>
      </div>
    </form>
  )
}
