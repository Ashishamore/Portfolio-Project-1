import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { ALL_SPECIALTIES } from '../lib/mockData'
import { PROFICIENCY_LEVELS } from '../lib/filters'
import type { Proficiency } from '../lib/types'
import ComposerHeader from '../components/ComposerHeader'
import { Avatar } from '../components/ui'

/** Avatars are never shown large, so the picked photo is squared off and boxed down to this. */
const AVATAR_SIZE = 256

/** Centre-crops whatever came out of the gallery into a square avatar. */
async function toSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no 2d context')

  const scale = Math.max(AVATAR_SIZE / bitmap.width, AVATAR_SIZE / bitmap.height)
  const width = bitmap.width * scale
  const height = bitmap.height * scale
  ctx.drawImage(bitmap, (AVATAR_SIZE - width) / 2, (AVATAR_SIZE - height) / 2, width, height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', 0.85)
}

/** Backdrops for the initials, used when no photo is set. */
const GRADIENTS = [
  'from-indigo-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-green-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-slate-500 to-slate-700',
  'from-teal-500 to-emerald-600',
]

/** How quickly you answer, offered as set phrases so profiles stay comparable. */
const RESPONSE_TIMES = ['under 1 hr', 'a few hours', 'within a day', 'within 2 days']

/** Equipment carries no id of its own, so the editor keeps one for list keys. */
type DraftGroup = { id: string; category: string; items: string[] }

export default function EditProfile() {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useStore()

  const [avatar, setAvatar] = useState(currentUser.avatar)
  const [gradient, setGradient] = useState(currentUser.gradient)
  const [name, setName] = useState(currentUser.name)
  const [handle, setHandle] = useState(currentUser.handle)
  const [city, setCity] = useState(currentUser.city)
  const [state, setState] = useState(currentUser.state)
  const [bio, setBio] = useState(currentUser.bio)
  const [specialties, setSpecialties] = useState<string[]>(currentUser.specialties)
  const [customSpecialty, setCustomSpecialty] = useState('')
  const [proficiency, setProficiency] = useState<Proficiency>(currentUser.proficiency)
  const [dayRate, setDayRate] = useState(String(currentUser.dayRate))
  const [respondsIn, setRespondsIn] = useState(currentUser.respondsIn)
  const [equipment, setEquipment] = useState<DraftGroup[]>(() =>
    currentUser.equipment.map((g, i) => ({ id: `eq${i}`, category: g.category, items: [...g.items] })),
  )
  const [error, setError] = useState('')

  // The preset list plus anything typed in, so a custom specialty is a chip like the rest.
  const specialtyOptions = Array.from(new Set([...ALL_SPECIALTIES, ...specialties]))

  function toggleSpecialty(value: string) {
    setSpecialties((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    )
  }

  function addCustomSpecialty() {
    const value = customSpecialty.trim()
    if (!value) return
    // Matching an existing one case-insensitively keeps "candid" from joining "Candid".
    const existing = specialtyOptions.find((s) => s.toLowerCase() === value.toLowerCase())
    setSpecialties((prev) => {
      const next = existing ?? value
      return prev.includes(next) ? prev : [...prev, next]
    })
    setCustomSpecialty('')
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Cleared so picking the same photo again still counts as a change.
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('That file is not a photo.')
      return
    }
    try {
      setAvatar(await toSquareDataUrl(file))
      setError('')
    } catch {
      setError('That photo could not be opened. Try another one.')
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const cleanHandle = handle.trim().replace(/\s+/g, '')
    const rate = Number(dayRate)

    if (!name.trim()) {
      setError('Your name cannot be empty.')
      return
    }
    if (cleanHandle.replace('@', '').length < 2) {
      setError('Pick a username of at least two characters.')
      return
    }
    if (!city.trim() || !state.trim()) {
      setError('Add the city and state you are based in.')
      return
    }
    if (!Number.isFinite(rate) || rate < 0) {
      setError('Your day rate must be a number.')
      return
    }

    updateProfile({
      avatar,
      gradient,
      name: name.trim(),
      handle: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`,
      city: city.trim(),
      state: state.trim(),
      bio: bio.trim(),
      specialties,
      proficiency,
      dayRate: Math.round(rate),
      respondsIn,
      // Half-filled rows are dropped rather than saved as blanks.
      equipment: equipment
        .filter((g) => g.category.trim() && g.items.length > 0)
        .map((g) => ({ category: g.category.trim(), items: g.items })),
    })
    navigate('/profile')
  }

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-y-auto pb-6">
      <ComposerHeader
        title="Edit profile"
        subtitle="How you appear to other photographers"
        backTo="/profile"
        backLabel="Back to profile"
      />

      <div className="space-y-5 px-5 pt-4">
        <div className="flex flex-col items-center">
          <Avatar name={name || currentUser.name} gradient={gradient} image={avatar} size="lg" />

          <div className="mt-3 flex items-center gap-2">
            {/* A label wrapping the input is the whole control — tapping it opens the gallery. */}
            <label className="cursor-pointer rounded-xl bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400">
              {avatar ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
            </label>

            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar(undefined)}
                className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300"
              >
                Remove
              </button>
            )}
          </div>

          <p className="mt-2 text-[10px] text-slate-500">
            Pick a photo from your gallery — it is cropped square.
          </p>
        </div>

        {/* The colour only shows through once the photo is off, so it is offered there. */}
        {!avatar && (
          <Field label="Initials colour">
            <div className="flex flex-wrap gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradient(g)}
                  aria-label={`Use the ${g.split(' ')[0].replace('from-', '').replace(/-\d+$/, '')} background`}
                  aria-pressed={g === gradient}
                  className={`h-8 w-8 rounded-full bg-gradient-to-br ${g} transition ${
                    g === gradient ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:brightness-125'
                  }`}
                />
              ))}
            </div>
          </Field>
        )}

        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        </Field>

        <Field label="Username">
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@yourhandle"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Pune"
              className={inputClass}
            />
          </Field>
          <Field label="State">
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Maharashtra"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="What you shoot, where you travel, how you work with a crew…"
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Specialisations">
          <div className="flex flex-wrap gap-1.5">
            {specialtyOptions.map((s) => {
              const on = specialties.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  aria-pressed={on}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    on
                      ? 'bg-indigo-500 text-white'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {s}
                  {on && <span aria-hidden>×</span>}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              onKeyDown={(e) => {
                // Enter adds the specialty rather than submitting the whole form.
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomSpecialty()
                }
              }}
              placeholder="Add your own — Product, Sports…"
              className={`${inputClass} flex-1`}
            />
            <AddButton onClick={addCustomSpecialty} label="Add specialisation" />
          </div>
        </Field>

        <Field label="Level">
          <div className="flex flex-wrap gap-1.5">
            {PROFICIENCY_LEVELS.map((level) => (
              <ChoiceChip
                key={level}
                active={level === proficiency}
                onClick={() => setProficiency(level)}
              >
                {level}
              </ChoiceChip>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Day rate (₹)">
            <input
              type="number"
              min={0}
              step={500}
              value={dayRate}
              onChange={(e) => setDayRate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Responds in">
            <select
              value={respondsIn}
              onChange={(e) => setRespondsIn(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            >
              {RESPONSE_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Equipment">
          <div className="space-y-2">
            {equipment.map((group) => (
              <EquipmentGroupEditor
                key={group.id}
                group={group}
                onChange={(next) =>
                  setEquipment((prev) => prev.map((g) => (g.id === group.id ? next : g)))
                }
                onRemove={() => setEquipment((prev) => prev.filter((g) => g.id !== group.id))}
              />
            ))}

            <button
              type="button"
              onClick={() =>
                setEquipment((prev) => [
                  ...prev,
                  { id: `eq${Date.now()}`, category: '', items: [] },
                ])
              }
              className="w-full rounded-xl border border-dashed border-white/15 py-2.5 text-xs font-medium text-slate-400 transition hover:border-indigo-500/40 hover:text-white"
            >
              + Add equipment category
            </button>
          </div>
        </Field>

        <p className="text-[11px] leading-relaxed text-slate-500">
          Assignments, hires, followers, rating and reviews are earned on the platform, so they are
          not edited here.
        </p>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Save profile
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

/** One equipment category — its name, its kit, and a way to drop either. */
function EquipmentGroupEditor({
  group,
  onChange,
  onRemove,
}: {
  group: DraftGroup
  onChange: (next: DraftGroup) => void
  onRemove: () => void
}) {
  const [draft, setDraft] = useState('')

  function addItem() {
    const value = draft.trim()
    if (!value || group.items.includes(value)) {
      setDraft('')
      return
    }
    onChange({ ...group, items: [...group.items, value] })
    setDraft('')
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        <input
          value={group.category}
          onChange={(e) => onChange({ ...group, category: e.target.value })}
          placeholder="Cameras, Lenses, Lighting…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white placeholder:font-normal placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${group.category || 'this'} category`}
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path strokeLinecap="round" d="M5 7h14M10 7V5.5h4V7M8 7l.7 12h6.6L16 7" />
          </svg>
        </button>
      </div>

      {group.items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {group.items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 py-1 pl-2.5 pr-1 text-[11px] text-slate-300"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange({ ...group, items: group.items.filter((i) => i !== item) })}
                aria-label={`Remove ${item}`}
                className="rounded-full px-1 text-slate-500 transition hover:bg-rose-500/20 hover:text-rose-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          placeholder="Add a body, lens or light…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
        />
        <AddButton onClick={addItem} label={`Add to ${group.category || 'this category'}`} />
      </div>
    </div>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/15 hover:text-indigo-300"
    >
      +
    </button>
  )
}

function ChoiceChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-indigo-500 text-white'
          : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  )
}
