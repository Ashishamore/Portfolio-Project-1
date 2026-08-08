import { useState } from 'react'
import { Avatar } from './ui'
import { DEFAULT_ROLE, ROLE_PRESETS, isCustomRole } from '../lib/roles'

/** Bottom sheet for choosing one person's role, with a free-text option at the end. */
export default function RoleSheet({
  name,
  gradient,
  role,
  onSelect,
  onClose,
}: {
  name: string
  gradient: string
  role: string
  onSelect: (role: string) => void
  onClose: () => void
}) {
  const [custom, setCustom] = useState(isCustomRole(role) ? role : '')

  function choose(next: string) {
    onSelect(next)
    onClose()
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative max-h-[85%] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-900 pb-5">
        <div className="sticky top-0 z-10 bg-slate-900 px-5 pb-3 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="flex items-center gap-2.5">
            <Avatar name={name} gradient={gradient} size="sm" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-white">{name}</h2>
              <p className="text-[10px] text-slate-400">Pick a role on this assignment</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 px-5">
          {ROLE_PRESETS.map((r) => (
            <RoleOption
              key={r.name}
              icon={r.icon}
              title={r.name}
              hint={r.hint}
              selected={role === r.name}
              onClick={() => choose(r.name)}
            />
          ))}

          <RoleOption
            icon="❔"
            title={DEFAULT_ROLE}
            hint="Decide later"
            selected={role === DEFAULT_ROLE}
            onClick={() => choose(DEFAULT_ROLE)}
          />

          <div
            className={`mt-2 rounded-xl border p-2.5 transition ${
              isCustomRole(role) ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-white">
              <span>🏷️</span>
              Custom role
            </p>
            <div className="flex gap-2">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="e.g. Second Shooter"
                aria-label="Custom role name"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
              />
              <button
                type="button"
                disabled={!custom.trim()}
                onClick={() => choose(custom.trim())}
                className="shrink-0 rounded-lg bg-indigo-500 px-3 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
              >
                Use
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleOption({
  icon,
  title,
  hint,
  selected,
  onClick,
}: {
  icon: string
  title: string
  hint: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
        selected ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-white">{title}</span>
        <span className="block truncate text-[10px] text-slate-500">{hint}</span>
      </span>
      {selected && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4 shrink-0 text-indigo-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      )}
    </button>
  )
}
