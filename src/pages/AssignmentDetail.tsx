import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/storeContext'
import {
  addDays,
  addHoursToTime,
  formatLongDate,
  formatTime12,
  fromISO,
  toISO,
} from '../lib/date'
import { DEFAULT_ROLE, roleIcon } from '../lib/roles'
import type { Assignment, InviteResponse, InviteStatus, Photographer } from '../lib/types'
import { Avatar, InviteBadge, PinIcon } from '../components/ui'
import ChatPanel from '../components/ChatPanel'
import ParticipantPicker from '../components/ParticipantPicker'
import RoleSheet from '../components/RoleSheet'

type Tab = 'details' | 'chats'

export default function AssignmentDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const {
    getAssignment,
    canEditAssignment,
    updateAssignment,
    deleteAssignment,
    getPhotographer,
    currentUser,
    getAssignmentConversation,
    toggleAssignmentApproval,
    addParticipant,
    removeParticipant,
    setParticipantRole,
    respondToInvite,
  } = useStore()

  const [tab, setTab] = useState<Tab>('details')
  const [editing, setEditing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [roleTargetId, setRoleTargetId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const assignment = getAssignment(id)

  if (!assignment) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-slate-400">That assignment could not be found.</p>
        <Link to="/schedule" className="text-xs font-semibold text-indigo-400">
          Back to schedule
        </Link>
      </div>
    )
  }

  const canEdit = canEditAssignment(assignment.id)
  const owner = getPhotographer(assignment.ownerId)
  const crew = assignment.participantIds
    .map((pid) => getPhotographer(pid))
    .filter((p): p is Photographer => Boolean(p))
  const conversation = getAssignmentConversation(assignment.id)
  const roleTarget = crew.find((p) => p.id === roleTargetId)
  // Undefined when the user owns the shoot — an owner is never asked to join it.
  const myInvite = assignment.invites[currentUser.id]

  const teamSize = crew.length + 1
  const endDate = toISO(addDays(fromISO(assignment.startDate), assignment.durationDays - 1))
  const endTime = addHoursToTime(assignment.startTime, assignment.durationHours)

  return (
    <div className="relative flex h-full flex-col">
      <div className="shrink-0 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="-m-1 shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" />
            </svg>
          </button>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/15 text-indigo-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
              <path strokeLinecap="round" d="M8 3v4M16 3v4M3.5 10h17" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-white">{assignment.name}</p>
            <p className="text-[10px] text-slate-400">Team of {teamSize}</p>
          </div>
        </div>

        <div className="flex">
          <TabButton active={tab === 'details'} onClick={() => setTab('details')}>
            Details
          </TabButton>
          <TabButton active={tab === 'chats'} onClick={() => setTab('chats')}>
            Chats
          </TabButton>
        </div>
      </div>

      {tab === 'details' ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <div className="space-y-4 px-5 pt-4">
              {editing ? (
                <EditFields
                  assignment={assignment}
                  onChange={(patch) => updateAssignment(assignment.id, patch)}
                />
              ) : (
                <>
                  <h1 className="text-lg font-semibold leading-snug text-indigo-300">
                    {assignment.name}
                  </h1>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      {formatLongDate(assignment.startDate)}
                    </p>
                    {assignment.durationDays > 1 && (
                      <p className="text-xs text-slate-400">
                        through {formatLongDate(endDate)} · {assignment.durationDays} days
                      </p>
                    )}
                    <p className="text-sm text-slate-300">
                      {formatTime12(assignment.startTime)} – {formatTime12(endTime)}
                      <span className="text-xs text-slate-500">
                        {' '}
                        ({assignment.durationHours}h)
                      </span>
                    </p>
                    <p className="flex items-start gap-1.5 pt-1 text-sm text-rose-400">
                      <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Location : {assignment.location}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ApprovalControl
                      approved={assignment.approved}
                      canEdit={canEdit}
                      onToggle={() => toggleAssignmentApproval(assignment.id)}
                    />
                    {canEdit ? (
                      <Tag tone="indigo">👑 Created by you</Tag>
                    ) : (
                      <Tag tone="amber">📩 Added by {owner?.name ?? 'someone'}</Tag>
                    )}
                    {myInvite && <InviteBadge status={myInvite} />}
                  </div>

                  {assignment.description && (
                    <div>
                      <h2 className="mb-1.5 text-sm font-semibold text-white">Description</h2>
                      <p className="text-xs leading-relaxed text-slate-300">{assignment.description}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">
                    Participants{' '}
                    <span className="font-normal text-slate-400">
                      ({String(teamSize).padStart(2, '0')})
                    </span>
                  </h2>
                  {!canEdit && <span className="text-[10px] text-slate-500">View only</span>}
                </div>

                <div className="divide-y divide-white/5">
                  {owner && (
                    <ParticipantRow
                      person={owner}
                      isSelf={owner.id === currentUser.id}
                      subtitle="Assignment Owner"
                    />
                  )}

                  {crew.map((p) => (
                    <ParticipantRow
                      key={p.id}
                      person={p}
                      isSelf={p.id === currentUser.id}
                      subtitle={`Role : ${assignment.roles[p.id] ?? DEFAULT_ROLE}`}
                      role={assignment.roles[p.id] ?? DEFAULT_ROLE}
                      invite={assignment.invites[p.id] ?? 'awaited'}
                      onEditRole={canEdit ? () => setRoleTargetId(p.id) : undefined}
                      onRemove={canEdit ? () => removeParticipant(assignment.id, p.id) : undefined}
                    />
                  ))}
                </div>

                {crew.length === 0 && (
                  <p className="py-3 text-[11px] text-slate-500">No crew on this assignment yet.</p>
                )}

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="mt-2 w-full rounded-xl border border-dashed border-white/15 py-2.5 text-xs font-medium text-slate-400 transition hover:border-indigo-500/40 hover:text-white"
                  >
                    + Add participants
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit and Delete belong to the owner alone. Everyone else gets the
              invitation they were added under, which is theirs to answer. */}
          {canEdit ? (
            <div className="flex shrink-0 gap-3 border-t border-white/10 bg-slate-950/95 px-5 py-3 backdrop-blur">
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                {editing ? 'Done' : 'Edit'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300"
              >
                Delete
              </button>
            </div>
          ) : (
            myInvite && (
              <InviteBar
                status={myInvite}
                ownerName={owner?.name ?? 'Someone'}
                onRespond={(response) => respondToInvite(assignment.id, response)}
              />
            )
          )}
        </>
      ) : conversation ? (
        <ChatPanel
          conversationId={conversation.id}
          placeholder="Message the group"
          emptyState={
            <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="text-xs text-slate-400">This is the group chat for {assignment.name}.</p>
              <p className="text-[10px] text-slate-600">
                Everyone on the assignment can see what is posted here.
              </p>
            </div>
          }
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-slate-500">This assignment has no group chat.</p>
        </div>
      )}

      {pickerOpen && (
        <ParticipantPicker
          selectedIds={assignment.participantIds}
          onToggle={(pid) =>
            assignment.participantIds.includes(pid)
              ? removeParticipant(assignment.id, pid)
              : addParticipant(assignment.id, pid)
          }
          onClose={() => setPickerOpen(false)}
        />
      )}

      {roleTarget && (
        <RoleSheet
          name={roleTarget.name}
          gradient={roleTarget.gradient}
          role={assignment.roles[roleTarget.id] ?? DEFAULT_ROLE}
          onSelect={(role) => setParticipantRole(assignment.id, roleTarget.id, role)}
          onClose={() => setRoleTargetId(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDelete
          name={assignment.name}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            deleteAssignment(assignment.id)
            navigate('/schedule')
          }}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex-1 border-b-2 pb-2.5 pt-1 text-sm font-semibold transition ${
        active
          ? 'border-indigo-400 text-indigo-300'
          : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * The invited member's own answer, pinned to the bottom of the details tab the
 * way Edit/Delete is for the owner. An answer is never final — either way the
 * opposite move stays one tap away, and neither one touches the group chat.
 */
function InviteBar({
  status,
  ownerName,
  onRespond,
}: {
  status: InviteStatus
  ownerName: string
  onRespond: (response: InviteResponse) => void
}) {
  if (status === 'awaited') {
    return (
      <div className="shrink-0 border-t border-white/10 bg-slate-950/95 px-5 py-3 backdrop-blur">
        <p className="text-[11px] leading-relaxed text-slate-400">
          <span className="font-semibold text-white">{ownerName}</span> added you to this assignment.
          Answer to confirm your dates — you can message the crew either way.
        </p>
        <div className="mt-2.5 flex gap-3">
          <button
            type="button"
            onClick={() => onRespond('accepted')}
            className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => onRespond('rejected')}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300"
          >
            Reject
          </button>
        </div>
      </div>
    )
  }

  const accepted = status === 'accepted'

  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-white/10 bg-slate-950/95 px-5 py-3 backdrop-blur">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          accepted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4">
          {accepted ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="m7 7 10 10M17 7 7 17" />
          )}
        </svg>
      </span>

      <p className="min-w-0 flex-1 text-xs font-medium text-white">
        You {accepted ? 'accepted' : 'rejected'} this invitation
      </p>

      <button
        type="button"
        onClick={() => onRespond(accepted ? 'rejected' : 'accepted')}
        className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        {accepted ? 'Reject instead' : 'Accept instead'}
      </button>
    </div>
  )
}

/** Approval reads as a filled control the owner can change, a flat tag otherwise. */
function ApprovalControl({
  approved,
  canEdit,
  onToggle,
}: {
  approved: boolean
  canEdit: boolean
  onToggle: () => void
}) {
  const label = approved ? 'Approved' : 'Unapproved'

  if (!canEdit) {
    return (
      <span
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
          approved
            ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
            : 'border-white/15 bg-white/10 text-slate-400'
        }`}
      >
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title="Change approval"
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${
        approved ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-500 hover:bg-indigo-400'
      }`}
    >
      {label}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3 w-3 opacity-80">
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

function ParticipantRow({
  person,
  isSelf,
  subtitle,
  role,
  invite,
  onEditRole,
  onRemove,
}: {
  person: Photographer
  isSelf: boolean
  subtitle: string
  /** Present for crew, so the row can show the role's icon. */
  role?: string
  /** Present for crew. The owner was never invited, so their row carries none. */
  invite?: InviteStatus
  onEditRole?: () => void
  onRemove?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative flex items-center gap-3 py-2.5">
      <Avatar name={person.name} gradient={person.gradient} image={person.avatar} size="sm" />

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-white">
          <span className="truncate">
            {person.name}
            {isSelf && ' (you)'}
          </span>
          {invite && <InviteBadge status={invite} compact />}
        </p>
        <p className="truncate text-[11px] text-indigo-300/80">
          {role && <span aria-hidden>{roleIcon(role)} </span>}
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={`Options for ${person.name}`}
        aria-expanded={menuOpen}
        className="-m-1 shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl shadow-black/50">
            {!isSelf && (
              <Link
                to={`/photographer/${person.id}`}
                className="block rounded-lg px-2.5 py-2 text-[11px] font-medium text-white transition hover:bg-white/5"
              >
                View profile
              </Link>
            )}
            {onEditRole && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onEditRole()
                }}
                className="block w-full rounded-lg px-2.5 py-2 text-left text-[11px] font-medium text-white transition hover:bg-white/5"
              >
                Change role
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onRemove()
                }}
                className="block w-full rounded-lg px-2.5 py-2 text-left text-[11px] font-medium text-rose-400 transition hover:bg-rose-500/10"
              >
                Remove from assignment
              </button>
            )}
            {isSelf && !onEditRole && (
              <p className="px-2.5 py-2 text-[11px] text-slate-500">No actions available</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ConfirmDelete({
  name,
  onCancel,
  onConfirm,
}: {
  name: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative rounded-t-3xl border-t border-white/10 bg-slate-900 px-5 pb-5 pt-4">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <h2 className="text-sm font-semibold text-white">Delete this assignment?</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          “{name}” and its group chat will be removed for everyone on it. This cannot be undone.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/** Owner-only editing of the assignment's own fields. Saves as you type. */
function EditFields({
  assignment,
  onChange,
}: {
  assignment: Assignment
  onChange: (patch: Partial<Assignment>) => void
}) {
  return (
    <div className="space-y-3">
      <Field label="Assignment name">
        <input
          value={assignment.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={inputClass}
        />
      </Field>

      <Field label="Location">
        <input
          value={assignment.location}
          onChange={(e) => onChange({ location: e.target.value })}
          className={inputClass}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={assignment.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date">
          <input
            type="date"
            value={assignment.startDate}
            onChange={(e) => e.target.value && onChange({ startDate: e.target.value })}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
        <Field label="Duration (days)">
          <input
            type="number"
            min={1}
            value={assignment.durationDays}
            onChange={(e) => onChange({ durationDays: Math.max(1, Number(e.target.value) || 1) })}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Call time">
          <input
            type="time"
            value={assignment.startTime}
            onChange={(e) => e.target.value && onChange({ startTime: e.target.value })}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
        <Field label="Hours per day">
          <input
            type="number"
            min={1}
            max={24}
            value={assignment.durationHours}
            onChange={(e) =>
              onChange({ durationHours: Math.min(24, Math.max(1, Number(e.target.value) || 1)) })
            }
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  )
}

function Tag({ tone, children }: { tone: 'indigo' | 'amber'; children: React.ReactNode }) {
  const styles =
    tone === 'indigo'
      ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-300'
      : 'border-amber-400/30 bg-amber-500/15 text-amber-300'
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles}`}>
      {children}
    </span>
  )
}
