export type Proficiency = 'Emerging' | 'Intermediate' | 'Advanced' | 'Expert'

export type Review = {
  id: string
  author: string
  authorGradient: string
  rating: number
  daysAgo: number
  text: string
}

export type WorkSample = {
  id: string
  title: string
  gradient: string
}

export type EquipmentGroup = {
  category: string
  items: string[]
}

export type Photographer = {
  id: string
  name: string
  handle: string
  /** Initials sit on this gradient whenever there is no `avatar` photo. */
  gradient: string
  /** Imported asset URL of the profile photo. Falls back to initials when unset. */
  avatar?: string
  city: string
  state: string
  bio: string
  specialties: string[]
  proficiency: Proficiency
  dayRate: number
  rating: number
  timesHired: number
  assignmentCount: number
  followers: number
  respondsIn: string
  equipment: EquipmentGroup[]
  recentWork: WorkSample[]
  reviews: Review[]
  /** ISO yyyy-mm-dd dates the photographer is already booked. */
  occupiedDates: string[]
}

export type Post = {
  id: string
  photographerId: string
  /** Imported asset URL for the photo. */
  image: string
  /** Describes the photo for screen readers. */
  alt: string
  caption: string
  likes: number
  comments: number
  /** ISO yyyy-mm-dd the post went up. */
  postedOn: string
}

export type StoryOverlay = {
  id: string
  kind: 'text' | 'sticker'
  value: string
  /** Position as a percentage of the frame, so it survives any screen size. */
  x: number
  y: number
  color: string
  /** Font size in px at a 390px-wide frame. */
  size: number
}

export type Story = {
  id: string
  photographerId: string
  image: string
  overlays: StoryOverlay[]
  /** PNG data URL of the freehand drawing layer, when anything was drawn. */
  drawing?: string
  audience: 'public' | 'closeFriends'
  /** Minutes since it went up — stories are treated as expiring after 24h. */
  minutesAgo: number
}

export type Message = {
  id: string
  /**
   * 'me' is the signed-in user. In a one-to-one chat 'them' is the other side;
   * in an assignment group chat this is the sender's photographer id.
   */
  from: string
  text: string
  /** Minutes since the message was sent — kept relative so the mock never goes stale. */
  minutesAgo: number
}

/** A one-to-one thread with a photographer. */
export type DirectConversation = {
  id: string
  kind: 'direct'
  photographerId: string
  unread: number
  /** Oldest first; the last entry drives the preview row and the list ordering. */
  messages: Message[]
}

/** The group chat that every assignment gets, named after the assignment. */
export type AssignmentConversation = {
  id: string
  kind: 'assignment'
  assignmentId: string
  unread: number
  messages: Message[]
}

export type Conversation = DirectConversation | AssignmentConversation

/**
 * Where a crew member stands on the invitation that put them on an assignment.
 * Being added is a request, not a booking — nobody is committed until they answer.
 * Declining does not remove them: they keep their seat in the group chat either way.
 */
export type InviteStatus = 'awaited' | 'accepted' | 'rejected'

/** An answered invite. The owner is never asked, so they hold neither. */
export type InviteResponse = Exclude<InviteStatus, 'awaited'>

export type Assignment = {
  id: string
  /** Photographer id of whoever created it — they hold the Owner role. */
  ownerId: string
  name: string
  location: string
  description: string
  startDate: string
  durationDays: number
  /** 24h HH:mm the shoot call time — rendered as 06:00 AM on the schedule. */
  startTime: string
  /** Hours worked on each day of the assignment. */
  durationHours: number
  /** Crew sign-off. Fresh assignments start unapproved until the team confirms. */
  approved: boolean
  /** The crew, excluding the owner. Includes the signed-in user when they were invited on. */
  participantIds: string[]
  /** Photographer id → role on this assignment, including the creator's Owner entry. */
  roles: Record<string, string>
  /**
   * Photographer id → where they stand on their invite. Keyed by participant, so
   * the owner never appears here. Everyone added starts out 'awaited'.
   */
  invites: Record<string, InviteStatus>
}

/**
 * How a single calendar day reads on the schedule.
 * 'occupied' is derived from assignments, never set by hand; the other two are
 * the user marking their own availability.
 */
export type DayStatus = 'occupied' | 'available' | 'unavailable'

/** What the user did. The activity log is their own record, not anyone else's. */
export type ActivityKind =
  | 'save'
  | 'like'
  | 'follow'
  | 'post'
  | 'story'
  | 'assignment'
  | 'invite'
  | 'profile'
  | 'account'

export type ActivityEntry = {
  id: string
  kind: ActivityKind
  /** The action itself — "Saved Devansh Kapoor". */
  title: string
  /** Supporting line, when the action has more to say than its title. */
  detail?: string
  /** Where tapping the row leads, when the thing acted on still exists. */
  to?: string
  /** Epoch ms. The log reads newest first and groups by day. */
  at: number
}

/** Which pushes the user still wants. Everything defaults to on. */
export type NotificationPrefs = {
  invites: boolean
  messages: boolean
  comments: boolean
  follows: boolean
  reminders: boolean
  emailDigest: boolean
  /** Mutes everything overnight rather than switching categories off. */
  quietHours: boolean
}

/** Who may open a chat with the user. 'crew' is anyone they have worked with. */
export type MessagePolicy = 'everyone' | 'crew' | 'nobody'

export type PrivacySettings = {
  /** Only approved followers see posts and stories. */
  privateAccount: boolean
  /** Whether the profile calendar publishes booked days at all. */
  showAvailability: boolean
  showDayRate: boolean
  /** Whether the profile turns up in search and suggestions. */
  discoverable: boolean
  messagesFrom: MessagePolicy
  /** Photographer ids the user has blocked. */
  blockedIds: string[]
}

/** Where a badge application stands. Review is never instant. */
export type VerificationStatus = 'unverified' | 'pending' | 'verified'

export type VerificationRequest = {
  status: VerificationStatus
  fullName: string
  /** What they are being verified as — Photographer, Studio, Agency. */
  category: string
  idType: string
  /** A link that backs the claim: portfolio, publication, agency page. */
  portfolio: string
  note: string
  submittedAt?: number
}

/** An account on the device. Only one is signed in at a time. */
export type LinkedAccount = {
  id: string
  name: string
  handle: string
  gradient: string
  avatar?: string
}

/**
 * What set a notification off. 'reminder' is the app nudging the user about
 * their own day; every other kind is someone else acting on them.
 */
export type NotificationKind = 'follow' | 'comment' | 'assignment' | 'message' | 'reminder'

export type AppNotification = {
  id: string
  kind: NotificationKind
  /** Whoever triggered it. Reminders come from the app, so they have no actor. */
  actorId?: string
  /** Headline. The actor's name is rendered separately, alongside their avatar. */
  title: string
  /** Supporting line — the comment itself, a message preview, the shoot in question. */
  detail?: string
  /**
   * Set on invitations, so the row can show where the invite currently stands
   * rather than going stale the moment it is answered.
   */
  assignmentId?: string
  /** Where tapping the row lands. Every one points at a screen that exists. */
  to: string
  /** Minutes since it fired — kept relative so the mock never goes stale. */
  minutesAgo: number
  read: boolean
}
