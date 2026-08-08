import { useStore } from '../lib/storeContext'
import type { NotificationPrefs } from '../lib/types'
import BackHeader from '../components/BackHeader'
import { Toggle } from '../components/ui'

const GROUPS: {
  title: string
  hint?: string
  items: { key: keyof NotificationPrefs; label: string; hint: string }[]
}[] = [
  {
    title: 'Work',
    items: [
      {
        key: 'invites',
        label: 'Assignment invites',
        hint: 'When someone adds you to a shoot, and when they change its date.',
      },
      {
        key: 'reminders',
        label: 'Shoot reminders',
        hint: 'The evening before a call time, and again two hours ahead.',
      },
    ],
  },
  {
    title: 'People',
    items: [
      { key: 'messages', label: 'Messages', hint: 'Direct messages and assignment group chats.' },
      { key: 'comments', label: 'Comments', hint: 'Replies on photos you posted.' },
      { key: 'follows', label: 'New followers', hint: 'When a photographer starts following you.' },
    ],
  },
  {
    title: 'Digest',
    hint: 'Summaries rather than alerts.',
    items: [
      {
        key: 'emailDigest',
        label: 'Weekly email',
        hint: 'Bookings, invites and profile views from the past week.',
      },
      {
        key: 'quietHours',
        label: 'Quiet hours',
        hint: 'Holds everything back between 10pm and 7am, apart from shoot-day reminders.',
      },
    ],
  },
]

export default function NotificationSettings() {
  const { notificationPrefs, setNotificationPref } = useStore()

  const allOff = GROUPS.flatMap((g) => g.items).every(
    (item) => item.key === 'quietHours' || !notificationPrefs[item.key],
  )

  return (
    <div className="h-full overflow-y-auto pb-6">
      <BackHeader title="Notifications" subtitle="What reaches you, and when" />

      <div className="space-y-4 px-4 pt-4">
        {allOff && (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-200">
            Every notification is off. You will still see invites and messages in the app, but
            nothing will reach you outside it.
          </p>
        )}

        {GROUPS.map((group) => (
          <section key={group.title}>
            <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </p>
            {group.hint && <p className="px-1 pb-1.5 text-[10px] text-slate-600">{group.hint}</p>}

            <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {group.items.map((item) => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  hint={item.hint}
                  checked={notificationPrefs[item.key]}
                  onChange={(next) => setNotificationPref(item.key, next)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
