import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import { toISO } from '../lib/date'
import { Avatar } from '../components/ui'
import ComposerHeader from '../components/ComposerHeader'
import ParticipantPicker from '../components/ParticipantPicker'
import RoleSheet from '../components/RoleSheet'
import { DEFAULT_ROLE, OWNER_ROLE, roleIcon } from '../lib/roles'

export default function CreateAssignment() {
  const navigate = useNavigate()
  const { photographers, currentUser, createAssignment } = useStore()
  // Arriving from a day on the availability calendar starts on that date.
  const pickedDate = (useLocation().state as { date?: string } | null)?.date

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(pickedDate ?? toISO(new Date()))
  const [durationDays, setDurationDays] = useState('1')
  const [startTime, setStartTime] = useState('09:00')
  const [durationHours, setDurationHours] = useState('8')
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [roles, setRoles] = useState<Record<string, string>>({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const [roleTargetId, setRoleTargetId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const selected = photographers.filter((p) => participantIds.includes(p.id))
  const roleTarget = selected.find((p) => p.id === roleTargetId)

  function toggleParticipant(id: string) {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    setRoles((prev) => {
      if (prev[id]) {
        const { [id]: _dropped, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: DEFAULT_ROLE }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const days = Number(durationDays)
    const hours = Number(durationHours)

    if (!name.trim() || !location.trim()) {
      setError('Assignment name and location are required.')
      return
    }
    if (!Number.isFinite(days) || days < 1) {
      setError('Duration must be at least 1 day.')
      return
    }
    if (!Number.isFinite(hours) || hours < 1 || hours > 24) {
      setError('Hours per day must be between 1 and 24.')
      return
    }
    if (!startTime) {
      setError('Pick a call time for the shoot.')
      return
    }

    const created = createAssignment({
      ownerId: currentUser.id,
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      startDate,
      durationDays: days,
      startTime,
      durationHours: hours,
      // The crew has not signed off on a brand new assignment yet.
      approved: false,
      participantIds,
      roles: { ...roles, [currentUser.id]: OWNER_ROLE },
      // Everyone picked here is being invited, not booked — each has to answer.
      invites: Object.fromEntries(participantIds.map((pid) => [pid, 'awaited' as const])),
      // Nobody has been scheduled onto days yet; shifts fill in as invites are accepted.
      shifts: {},
    })

    // Land on the schedule with the shoot's own date selected, so the new event
    // is the thing you see rather than whatever week today happens to be.
    navigate('/schedule', { state: { focusDate: startDate, assignmentId: created.id } })
  }

  return (
    <div className="relative h-full">
      <form onSubmit={handleSubmit} className="h-full overflow-y-auto pb-6">
        <ComposerHeader title="New assignment" subtitle="Set it up, then bring people onto it" />

        <div className="space-y-4 px-5 pt-4">
          <Field label="Assignment name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kapoor Wedding — Udaipur"
              className={inputClass}
            />
          </Field>

          <Field label="Location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What the shoot involves, what help you need…"
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </Field>
            <Field label="Duration (days)">
              <input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Call time">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </Field>
            <Field label="Hours per day">
              <input
                type="number"
                min={1}
                max={24}
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Crew and roles">
            <div className="space-y-2">
              {/* The creator is always on the assignment, and always as Owner. */}
              <div className="flex items-center gap-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5">
                <Avatar name={currentUser.name} gradient={currentUser.gradient} image={currentUser.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{currentUser.name} (you)</p>
                  <p className="text-[10px] text-slate-500">{currentUser.city}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-1 text-[10px] font-semibold text-indigo-300">
                  <span>{roleIcon(OWNER_ROLE)}</span>
                  {OWNER_ROLE}
                </span>
              </div>

              {selected.map((p) => {
                const role = roles[p.id] ?? DEFAULT_ROLE
                const unset = role === DEFAULT_ROLE

                return (
                  <div key={p.id} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
                    <Avatar name={p.name} gradient={p.gradient} image={p.avatar} size="sm" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                      <button
                        type="button"
                        onClick={() => setRoleTargetId(p.id)}
                        className={`mt-1 flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                          unset
                            ? 'border-dashed border-white/25 text-slate-400 hover:border-white/40 hover:text-white'
                            : 'border-transparent bg-white/10 text-slate-100 hover:bg-white/20'
                        }`}
                      >
                        <span>{roleIcon(role)}</span>
                        <span className="truncate">{unset ? 'Set role' : role}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-2.5 w-2.5 shrink-0 opacity-70">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleParticipant(p.id)}
                      aria-label={`Remove ${p.name}`}
                      className="-m-1 shrink-0 p-1 text-slate-500 transition hover:text-rose-400"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full rounded-xl border border-dashed border-white/15 py-2.5 text-xs font-medium text-slate-400 transition hover:border-white/30 hover:text-white"
              >
                + Add participants
              </button>
            </div>
          </Field>
        </div>

        <div className="px-5">
          {error && <p className="mt-4 text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Create assignment
          </button>
        </div>
      </form>

      {pickerOpen && (
        <ParticipantPicker
          selectedIds={participantIds}
          onToggle={toggleParticipant}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {roleTarget && (
        <RoleSheet
          name={roleTarget.name}
          gradient={roleTarget.gradient}
          role={roles[roleTarget.id] ?? DEFAULT_ROLE}
          onSelect={(role) => setRoles((prev) => ({ ...prev, [roleTarget.id]: role }))}
          onClose={() => setRoleTargetId(null)}
        />
      )}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  )
}
