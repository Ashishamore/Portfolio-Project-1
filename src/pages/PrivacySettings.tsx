import { useStore } from '../lib/storeContext'
import type { MessagePolicy } from '../lib/types'
import BackHeader from '../components/BackHeader'
import { Avatar, Toggle } from '../components/ui'

const MESSAGE_POLICIES: { key: MessagePolicy; label: string; hint: string }[] = [
  { key: 'everyone', label: 'Everyone', hint: 'Any photographer can start a thread with you.' },
  { key: 'crew', label: 'People you have worked with', hint: 'Anyone who has been on a shoot with you.' },
  { key: 'nobody', label: 'Nobody', hint: 'Only threads you start yourself.' },
]

export default function PrivacySettings() {
  const { privacy, updatePrivacy, unblockPhotographer, getPhotographer } = useStore()

  const blocked = privacy.blockedIds
    .map((id) => getPhotographer(id))
    .filter((p) => p !== undefined)

  return (
    <div className="h-full overflow-y-auto pb-6">
      <BackHeader title="Account privacy" subtitle="Who sees you, and what they see" />

      <div className="space-y-4 px-4 pt-4">
        <section>
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Visibility
          </p>
          <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Toggle
              label="Private account"
              hint="Only approved followers see your posts and stories. Your name and city stay public."
              checked={privacy.privateAccount}
              onChange={(next) => updatePrivacy({ privateAccount: next })}
            />
            <Toggle
              label="Show in search and suggestions"
              hint="Turn this off and only people with your username can find you."
              checked={privacy.discoverable}
              onChange={(next) => updatePrivacy({ discoverable: next })}
            />
          </div>
        </section>

        <section>
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            On your profile
          </p>
          <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Toggle
              label="Publish booked days"
              hint="Shows which days you are occupied — never what you are booked for."
              checked={privacy.showAvailability}
              onChange={(next) => updatePrivacy({ showAvailability: next })}
            />
            <Toggle
              label="Show day rate"
              hint="Hide it and people have to ask before they can budget."
              checked={privacy.showDayRate}
              onChange={(next) => updatePrivacy({ showDayRate: next })}
            />
          </div>
        </section>

        <section>
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Messages from
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {MESSAGE_POLICIES.map((policy) => {
              const active = privacy.messagesFrom === policy.key
              return (
                <button
                  key={policy.key}
                  type="button"
                  onClick={() => updatePrivacy({ messagesFrom: policy.key })}
                  aria-pressed={active}
                  className="flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/5"
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                      active ? 'border-indigo-400 bg-indigo-500' : 'border-white/25'
                    }`}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-white">{policy.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">
                      {policy.hint}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Blocked accounts
          </p>
          {blocked.length > 0 ? (
            <div className="space-y-1.5">
              {blocked.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
                >
                  <Avatar name={p.name} gradient={p.gradient} image={p.avatar} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{p.handle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => unblockPhotographer(p.id)}
                    className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-6 py-8 text-center">
              <p className="text-xs text-slate-400">Nobody is blocked.</p>
              <p className="mt-1.5 text-[10px] text-slate-600">
                Blocked photographers cannot message you or add you to a shoot.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
