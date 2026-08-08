import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import BackHeader from '../components/BackHeader'

const CATEGORIES = ['Photographer', 'Videographer', 'Studio', 'Agency']
const ID_TYPES = ['Aadhaar', 'PAN card', 'Passport', "Driver's licence"]

/** What review looks for, said plainly before anyone fills the form in. */
const CRITERIA = [
  { label: 'Authentic', hint: 'A real person or studio, with an identity document to match.' },
  { label: 'Complete', hint: 'A profile with a photo, bio, specialisations and work on it.' },
  { label: 'Notable', hint: 'Published work, agency listings or press that can be checked.' },
]

export default function Verification() {
  const { currentUser, verification, submitVerification, posts } = useStore()

  const [fullName, setFullName] = useState(verification.fullName || currentUser.name)
  const [category, setCategory] = useState(verification.category)
  const [idType, setIdType] = useState(verification.idType)
  const [portfolio, setPortfolio] = useState(verification.portfolio)
  const [note, setNote] = useState(verification.note)
  const [error, setError] = useState('')

  // The profile has to stand on its own before review is worth anyone's time.
  const ownPosts = posts.filter((p) => p.photographerId === currentUser.id).length
  const checks = [
    { label: 'Profile photo added', done: Boolean(currentUser.avatar) },
    { label: 'Bio written', done: currentUser.bio.trim().length >= 40 },
    { label: 'Specialisations picked', done: currentUser.specialties.length > 0 },
    { label: 'At least 3 photos posted', done: ownPosts >= 3 },
  ]
  const ready = checks.every((c) => c.done)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Your full name has to match your document.')
      return
    }
    if (!portfolio.trim()) {
      setError('Add a link that backs up your work.')
      return
    }
    submitVerification({
      fullName: fullName.trim(),
      category,
      idType,
      portfolio: portfolio.trim(),
      note: note.trim(),
    })
  }

  if (verification.status !== 'unverified') {
    const pending = verification.status === 'pending'
    return (
      <div className="h-full overflow-y-auto pb-6">
        <BackHeader title="Verification" subtitle={pending ? 'In review' : 'Verified'} />

        <div className="px-5 pt-6">
          <div
            className={`rounded-2xl border px-5 py-6 text-center ${
              pending
                ? 'border-amber-400/30 bg-amber-500/10'
                : 'border-emerald-400/30 bg-emerald-500/10'
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {pending ? '⏳' : '✅'}
            </span>
            <p className="mt-2 text-sm font-semibold text-white">
              {pending ? 'Your application is in review' : 'Your account is verified'}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
              {pending
                ? 'Reviews take up to 7 days. You will get a notification either way — there is nothing else to do in the meantime.'
                : 'The badge now sits beside your name across the app.'}
            </p>
          </div>

          <div className="mt-4 space-y-1.5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Detail label="Submitted as" value={verification.fullName} />
            <Detail label="Category" value={verification.category} />
            <Detail label="Document" value={verification.idType} />
            <Detail label="Link" value={verification.portfolio} />
            {verification.submittedAt && (
              <Detail
                label="Sent"
                value={new Date(verification.submittedAt).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              />
            )}
          </div>

          <Link
            to="/profile"
            className="mt-4 block rounded-xl border border-white/15 bg-white/5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-y-auto pb-6">
      <BackHeader title="Get verified" subtitle="Apply for a badge on your profile" />

      <div className="space-y-5 px-5 pt-4">
        <p className="text-[11px] leading-relaxed text-slate-400">
          A badge tells clients the account behind the work is who it says it is. Applying costs
          nothing, and turning one down does not affect how your profile ranks.
        </p>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            What review looks for
          </p>
          <div className="mt-2 space-y-2">
            {CRITERIA.map((c) => (
              <div key={c.label} className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  <span className="font-semibold text-white">{c.label}. </span>
                  {c.hint}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Your profile
          </p>
          <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {checks.map((check) => (
              <div key={check.label} className="flex items-center gap-2.5 px-4 py-2.5">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
                    check.done ? 'bg-emerald-500 text-white' : 'border border-white/20 text-slate-500'
                  }`}
                  aria-hidden
                >
                  {check.done ? '✓' : ''}
                </span>
                <span
                  className={`text-[11px] ${check.done ? 'text-slate-400' : 'font-medium text-white'}`}
                >
                  {check.label}
                </span>
              </div>
            ))}
          </div>
          {!ready && (
            <p className="mt-1.5 text-[10px] leading-relaxed text-amber-300/90">
              You can still apply, but applications from unfinished profiles are usually turned down.
            </p>
          )}
        </section>

        <Field label="Full name, as on your document">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full legal name"
            className={inputClass}
          />
        </Field>

        <Field label="Verifying as">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <Choice key={c} active={c === category} onClick={() => setCategory(c)}>
                {c}
              </Choice>
            ))}
          </div>
        </Field>

        <Field label="Identity document">
          <div className="flex flex-wrap gap-1.5">
            {ID_TYPES.map((t) => (
              <Choice key={t} active={t === idType} onClick={() => setIdType(t)}>
                {t}
              </Choice>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-600">
            You will be asked to upload it after this form is reviewed, never over chat.
          </p>
        </Field>

        <Field label="A link that backs your work">
          <input
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="yourstudio.com, an agency page, a published feature…"
            className={inputClass}
          />
        </Field>

        <Field label="Anything else review should know">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Awards, publications, the studio you shoot for…"
            className={`${inputClass} resize-none`}
          />
        </Field>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Send application
        </button>
      </div>
    </form>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-24 shrink-0 text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 break-words text-[11px] text-white">{value || '—'}</span>
    </div>
  )
}

function Choice({
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
