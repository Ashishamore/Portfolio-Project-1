import { createContext, useContext } from 'react'
import type {
  ActivityEntry,
  AppNotification,
  Assignment,
  Conversation,
  DayStatus,
  InviteResponse,
  InviteStatus,
  LinkedAccount,
  NotificationPrefs,
  Photographer,
  Post,
  PrivacySettings,
  Story,
  VerificationRequest,
} from './types'

export type Store = {
  photographers: Photographer[]
  currentUser: Photographer
  /**
   * Edits to the signed-in user's own profile. Reputation — rating, hires,
   * followers, reviews — is earned rather than typed, so it stays out of reach.
   */
  updateProfile: (patch: Partial<Omit<Photographer, 'id'>>) => void
  assignments: Assignment[]
  /** Most recent first — the home rail shows the head of this list. */
  conversations: Conversation[]
  getConversation: (id: string) => Conversation | undefined
  /** Finds or starts the thread with a photographer and returns its id. */
  openConversationWith: (photographerId: string) => string
  /** The group chat that belongs to an assignment. */
  getAssignmentConversation: (assignmentId: string) => Conversation | undefined
  sendMessage: (conversationId: string, text: string) => void
  /** Clears the unread badge once a thread has been opened. */
  markConversationRead: (conversationId: string) => void
  /** Home feed, newest first. */
  posts: Post[]
  createPost: (input: Pick<Post, 'image' | 'alt' | 'caption'>) => Post
  /** Stories the signed-in user has posted, newest first. */
  stories: Story[]
  createStory: (input: Pick<Story, 'image' | 'overlays' | 'drawing' | 'audience'>) => Story
  likedPostIds: string[]
  savedPostIds: string[]
  toggleLikedPost: (postId: string) => void
  toggleSavedPost: (postId: string) => void
  savedIds: string[]
  followingIds: string[]
  createAssignment: (input: Omit<Assignment, 'id'>) => Assignment
  /** Owner-only. Edits from anyone else are ignored. */
  updateAssignment: (assignmentId: string, patch: Partial<Omit<Assignment, 'id' | 'ownerId'>>) => void
  /** Owner-only. Removes the assignment and its group chat. */
  deleteAssignment: (assignmentId: string) => void
  getAssignment: (id: string) => Assignment | undefined
  /** True only for the assignment's owner; everyone else is view-only. */
  canEditAssignment: (id: string) => boolean
  /**
   * Adding someone sends an invite — they land on the crew as 'awaited'.
   * `dates` staffs particular days of a longer shoot; without it they are hired
   * for the whole run.
   */
  addParticipant: (
    assignmentId: string,
    photographerId: string,
    role?: string,
    dates?: string[],
  ) => void
  removeParticipant: (assignmentId: string, photographerId: string) => void
  /**
   * Which days of the run a crew member works. Days they already had keep their
   * hours. An empty list is ignored — dropping someone is `removeParticipant`.
   */
  setParticipantDays: (assignmentId: string, photographerId: string, dates: string[]) => void
  /** One person's hours on one day, for when a day runs on more than one crew. */
  setShiftTime: (
    assignmentId: string,
    photographerId: string,
    date: string,
    patch: { startTime?: string; durationHours?: number },
  ) => void
  setParticipantRole: (assignmentId: string, photographerId: string, role: string) => void
  /**
   * Where a member stands on their invite. Undefined for the owner and for
   * anyone not on the assignment, since neither was ever asked.
   */
  inviteStatus: (assignmentId: string, photographerId: string) => InviteStatus | undefined
  /** The signed-in user answering their own invite. Nobody can answer for anyone else. */
  respondToInvite: (assignmentId: string, response: InviteResponse) => void
  /** Assignments waiting on the signed-in user's answer, soonest first. */
  pendingInvites: Assignment[]
  /** Assignments covering a given ISO date, ordered by call time. */
  assignmentsOn: (iso: string) => Assignment[]
  /**
   * The user's own availability for a day, as shown on their profile calendar.
   * Assignments seed it to 'occupied', but an explicit choice always wins.
   */
  dayStatus: (iso: string) => DayStatus
  /** Sets availability for any day the user controls. Locked days ignore this. */
  setDayStatus: (iso: string, status: DayStatus) => void
  /**
   * True when another photographer has booked the user onto that day, which
   * pins it to Occupied — the commitment is not theirs to reverse.
   */
  isDayLocked: (iso: string) => boolean
  toggleAssignmentApproval: (assignmentId: string) => void
  /** The bell feed, newest first. */
  notifications: AppNotification[]
  /** Drives the badge on the bell. */
  unreadNotificationCount: number
  /** Clears one row — called as it is opened. */
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  toggleSaved: (photographerId: string) => void
  toggleFollowing: (photographerId: string) => void
  getPhotographer: (id: string) => Photographer | undefined
  /** The user's own record of what they have done, newest first. */
  activity: ActivityEntry[]
  clearActivity: () => void
  notificationPrefs: NotificationPrefs
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void
  privacy: PrivacySettings
  updatePrivacy: (patch: Partial<PrivacySettings>) => void
  unblockPhotographer: (photographerId: string) => void
  /** Where the badge application stands. Applying queues it for review. */
  verification: VerificationRequest
  submitVerification: (input: Omit<VerificationRequest, 'status' | 'submittedAt'>) => void
  /** Other accounts on the device. Only the current user is signed in. */
  linkedAccounts: LinkedAccount[]
  addAccount: (input: { name: string; handle: string }) => LinkedAccount
  /** Ends the session and returns every user-made change to its starting point. */
  signOut: () => void
  /** Universal search takes over the whole screen, so its state lives app-wide. */
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
