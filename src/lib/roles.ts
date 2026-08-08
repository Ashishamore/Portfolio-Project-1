export type RolePreset = { name: string; icon: string; hint: string }

/** Roles offered on an assignment. Anything outside this list is a custom role. */
export const ROLE_PRESETS: RolePreset[] = [
  { name: 'Cinematographer', icon: '🎥', hint: 'Motion and video coverage' },
  { name: 'Drone Pilot', icon: '🚁', hint: 'Aerials and establishing shots' },
  { name: 'Candid Photographer', icon: '📷', hint: 'Unposed, documentary stills' },
  { name: 'Assistant', icon: '🎒', hint: 'Gear, lighting and support' },
]

export const ROLE_NAMES = ROLE_PRESETS.map((r) => r.name)

/** The creator always holds this role and it cannot be reassigned. */
export const OWNER_ROLE = 'Owner'

/** What a participant gets until a role is picked for them. */
export const DEFAULT_ROLE = 'Unassigned'

export function isCustomRole(role: string): boolean {
  return role !== DEFAULT_ROLE && role !== OWNER_ROLE && !ROLE_NAMES.includes(role)
}

export function roleIcon(role: string): string {
  if (role === OWNER_ROLE) return '👑'
  if (role === DEFAULT_ROLE) return '❔'
  return ROLE_PRESETS.find((r) => r.name === role)?.icon ?? '🏷️'
}
