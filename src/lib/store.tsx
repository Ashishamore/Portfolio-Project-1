import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Assignment } from './types'
import { assignmentDates, toISO } from './date'
import { DEFAULT_ROLE } from './roles'
import type {
  ActivityEntry,
  ActivityKind,
  AppNotification,
  Conversation,
  DayStatus,
  InviteResponse,
  LinkedAccount,
  NotificationPrefs,
  Photographer,
  Post,
  PrivacySettings,
  Story,
  VerificationRequest,
} from './types'
import {
  assignmentChatSeeds,
  conversations as initialConversations,
  currentUser,
  initialActivity,
  initialAssignments,
  initialLinkedAccounts,
  initialNotificationPrefs,
  initialPrivacy,
  initialVerification,
  notifications as initialNotifications,
  photographers,
  posts as initialPosts,
} from './mockData'
import { StoreContext, type Store } from './storeContext'

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

/**
 * Every assignment gets a group chat, the way a scheduled meeting does. Seeded
 * assignments open with their crew's exchange; ones created in the app start empty.
 */
function groupChatFor(assignmentId: string): Conversation {
  const seed = assignmentChatSeeds[assignmentId]
  return {
    id: `g-${assignmentId}`,
    kind: 'assignment',
    assignmentId,
    unread: seed?.unread ?? 0,
    messages: seed?.messages ?? [],
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // The signed-in user's own profile is editable; `currentUser` from the mock is
  // only its starting point. The id never changes, so identity checks elsewhere
  // can keep reading the seed.
  const [profile, setProfile] = useState<Photographer>(currentUser)
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    ...initialAssignments.map((a) => groupChatFor(a.id)),
    ...initialConversations,
  ])
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [stories, setStories] = useState<Story[]>([])
  const [likedPostIds, setLikedPostIds] = useState<string[]>(['po3'])
  const [savedPostIds, setSavedPostIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>(['p2'])
  const [followingIds, setFollowingIds] = useState<string[]>(['p1', 'p5'])
  const [searchOpen, setSearchOpen] = useState(false)
  // Only days the user has explicitly marked; everything else falls back to available.
  const [markedDays, setMarkedDays] = useState<Record<string, DayStatus>>({})
  // The user's own record of what they have done, newest first.
  const [activity, setActivity] = useState<ActivityEntry[]>(initialActivity)
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(initialNotificationPrefs)
  const [privacy, setPrivacy] = useState<PrivacySettings>(initialPrivacy)
  const [verification, setVerification] = useState<VerificationRequest>(initialVerification)
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(initialLinkedAccounts)

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  const getPhotographer = useCallback(
    (id: string) => (id === profile.id ? profile : photographers.find((p) => p.id === id)),
    [profile],
  )

  /** Appends to the activity log. Everything the user does themselves lands here. */
  const logActivity = useCallback(
    (entry: { kind: ActivityKind; title: string; detail?: string; to?: string }) => {
      setActivity((prev) => [{ ...entry, id: `ac${Date.now()}`, at: Date.now() }, ...prev])
    },
    [],
  )

  /** Edits from the profile composer. Reputation — ratings, hires, followers — is not in scope. */
  const updateProfile = useCallback(
    (patch: Partial<Omit<Photographer, 'id'>>) => {
      setProfile((prev) => ({ ...prev, ...patch }))
      logActivity({ kind: 'profile', title: 'Updated your profile', to: '/profile' })
    },
    [logActivity],
  )

  const setNotificationPref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) =>
      setNotificationPrefs((prev) => ({ ...prev, [key]: value })),
    [],
  )

  const updatePrivacy = useCallback(
    (patch: Partial<PrivacySettings>) => setPrivacy((prev) => ({ ...prev, ...patch })),
    [],
  )

  const unblockPhotographer = useCallback(
    (id: string) =>
      setPrivacy((prev) => ({ ...prev, blockedIds: prev.blockedIds.filter((x) => x !== id) })),
    [],
  )

  /** Applying never verifies anyone on the spot — it queues the request for review. */
  const submitVerification = useCallback(
    (input: Omit<VerificationRequest, 'status' | 'submittedAt'>) => {
      setVerification({ ...input, status: 'pending', submittedAt: Date.now() })
      logActivity({
        kind: 'account',
        title: 'Applied for a verified badge',
        detail: 'Waiting on review',
        to: '/settings/verification',
      })
    },
    [logActivity],
  )

  const addAccount = useCallback(
    (input: { name: string; handle: string }) => {
      const account: LinkedAccount = {
        id: `acc${Date.now()}`,
        name: input.name,
        handle: input.handle,
        gradient: 'from-slate-500 to-slate-700',
      }
      setLinkedAccounts((prev) => [...prev, account])
      logActivity({ kind: 'account', title: `Added the account ${input.handle}` })
      return account
    },
    [logActivity],
  )

  const clearActivity = useCallback(() => setActivity([]), [])

  /** Ends the session and puts every user-made change back to where it started. */
  const signOut = useCallback(() => {
    setProfile(currentUser)
    setAssignments(initialAssignments)
    setConversations([...initialAssignments.map((a) => groupChatFor(a.id)), ...initialConversations])
    setNotifications(initialNotifications)
    setPosts(initialPosts)
    setStories([])
    setLikedPostIds(['po3'])
    setSavedPostIds([])
    setSavedIds(['p2'])
    setFollowingIds(['p1', 'p5'])
    setMarkedDays({})
    setActivity(initialActivity)
    setNotificationPrefs(initialNotificationPrefs)
    setPrivacy(initialPrivacy)
    setVerification(initialVerification)
    setLinkedAccounts(initialLinkedAccounts)
    setSearchOpen(false)
  }, [])

  const createAssignment = useCallback(
    (input: Omit<Assignment, 'id'>) => {
      const assignment: Assignment = { ...input, id: `a${Date.now()}` }
      setAssignments((prev) => [assignment, ...prev])
      // The group chat comes into being with the assignment, not on first message.
      setConversations((prev) => [groupChatFor(assignment.id), ...prev])
      logActivity({
        kind: 'assignment',
        title: `Created "${assignment.name}"`,
        detail: assignment.location,
        to: `/assignment/${assignment.id}`,
      })
      return assignment
    },
    [logActivity],
  )

  /** Owner-only edit. Anyone else holds view-only access to an assignment. */
  const updateAssignment = useCallback(
    (assignmentId: string, patch: Partial<Omit<Assignment, 'id' | 'ownerId'>>) => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId && a.ownerId === currentUser.id ? { ...a, ...patch } : a,
        ),
      )
    },
    [],
  )

  /** Owner-only. Takes the assignment's group chat down with it. */
  const deleteAssignment = useCallback(
    (assignmentId: string) => {
      const target = assignments.find((a) => a.id === assignmentId)
      if (!target || target.ownerId !== currentUser.id) return

      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
      setConversations((prev) =>
        prev.filter((c) => !(c.kind === 'assignment' && c.assignmentId === assignmentId)),
      )
    },
    [assignments],
  )

  const getAssignment = useCallback(
    (id: string) => assignments.find((a) => a.id === id),
    [assignments],
  )

  const canEditAssignment = useCallback(
    (id: string) => assignments.find((a) => a.id === id)?.ownerId === currentUser.id,
    [assignments],
  )

  // Adding someone is an invitation, not a booking, so they start out unanswered.
  const addParticipant = useCallback(
    (assignmentId: string, photographerId: string, role: string = DEFAULT_ROLE) => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId &&
          a.ownerId === currentUser.id &&
          !a.participantIds.includes(photographerId)
            ? {
                ...a,
                participantIds: [...a.participantIds, photographerId],
                roles: { ...a.roles, [photographerId]: role },
                invites: { ...a.invites, [photographerId]: 'awaited' },
              }
            : a,
        ),
      )
    },
    [],
  )

  const removeParticipant = useCallback((assignmentId: string, photographerId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId || a.ownerId !== currentUser.id) return a
        const { [photographerId]: _droppedRole, ...roles } = a.roles
        const { [photographerId]: _droppedInvite, ...invites } = a.invites
        return {
          ...a,
          participantIds: a.participantIds.filter((id) => id !== photographerId),
          roles,
          invites,
        }
      }),
    )
  }, [])

  const inviteStatus = useCallback(
    (assignmentId: string, photographerId: string) =>
      assignments.find((a) => a.id === assignmentId)?.invites[photographerId],
    [assignments],
  )

  /** Only ever touches the signed-in user's own row, and only if they were invited. */
  const respondToInvite = useCallback(
    (assignmentId: string, response: InviteResponse) => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId && a.participantIds.includes(currentUser.id)
            ? { ...a, invites: { ...a.invites, [currentUser.id]: response } }
            : a,
        ),
      )
      const target = assignments.find((a) => a.id === assignmentId)
      logActivity({
        kind: 'invite',
        title: `${response === 'accepted' ? 'Accepted' : 'Declined'} the invite to "${target?.name ?? 'an assignment'}"`,
        to: `/assignment/${assignmentId}`,
      })
    },
    [assignments, logActivity],
  )

  const pendingInvites = useMemo(
    () =>
      assignments
        .filter((a) => a.invites[currentUser.id] === 'awaited')
        .sort((x, y) => x.startDate.localeCompare(y.startDate)),
    [assignments],
  )

  const setParticipantRole = useCallback((assignmentId: string, photographerId: string, role: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId && a.ownerId === currentUser.id
          ? { ...a, roles: { ...a.roles, [photographerId]: role } }
          : a,
      ),
    )
  }, [])

  const toggleAssignmentApproval = useCallback((assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId && a.ownerId === currentUser.id ? { ...a, approved: !a.approved } : a,
      ),
    )
  }, [])

  // ISO date → the assignments running that day, so a 3-day shoot lands on all three.
  const byDate = useMemo(() => {
    const map = new Map<string, Assignment[]>()
    for (const a of assignments) {
      for (const iso of assignmentDates(a.startDate, a.durationDays)) {
        const list = map.get(iso)
        if (list) list.push(a)
        else map.set(iso, [a])
      }
    }
    for (const list of map.values()) list.sort((x, y) => x.startTime.localeCompare(y.startTime))
    return map
  }, [assignments])

  const assignmentsOn = useCallback((iso: string) => byDate.get(iso) ?? [], [byDate])

  /**
   * Days another photographer booked the user onto and the user accepted. An
   * accepted invite is a commitment to someone else, so it is not theirs to
   * reverse; a pending or declined one leaves the day their own.
   */
  const isDayLocked = useCallback(
    (iso: string) =>
      (byDate.get(iso) ?? []).some(
        (a) => a.ownerId !== currentUser.id && a.invites[currentUser.id] === 'accepted',
      ),
    [byDate],
  )

  // On unlocked days an assignment only suggests a default — whatever the user
  // picked by hand wins, since they may staff a shoot and work elsewhere. A shoot
  // they turned down makes no claim on the day at all.
  const dayStatus = useCallback(
    (iso: string): DayStatus => {
      if (isDayLocked(iso)) return 'occupied'
      const claimed = (byDate.get(iso) ?? []).some(
        (a) => a.ownerId === currentUser.id || a.invites[currentUser.id] !== 'rejected',
      )
      return markedDays[iso] ?? (claimed ? 'occupied' : 'available')
    },
    [byDate, markedDays, isDayLocked],
  )

  const setDayStatus = useCallback(
    (iso: string, status: DayStatus) => {
      if (isDayLocked(iso)) return
      setMarkedDays((prev) => ({ ...prev, [iso]: status }))
    },
    [isDayLocked],
  )

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  )

  /**
   * Conversation id for a photographer, starting an empty thread if there is no
   * history yet. Empty threads stay out of the chat list until something is sent.
   */
  const openConversationWith = useCallback(
    (photographerId: string): string => {
      const existing = conversations.find(
        (c) => c.kind === 'direct' && c.photographerId === photographerId,
      )
      if (existing) return existing.id

      const conversation: Conversation = {
        id: `c${Date.now()}`,
        kind: 'direct',
        photographerId,
        unread: 0,
        messages: [],
      }
      setConversations((prev) => [conversation, ...prev])
      return conversation.id
    },
    [conversations],
  )

  /** The group chat belonging to an assignment. Created alongside the assignment. */
  const getAssignmentConversation = useCallback(
    (assignmentId: string) =>
      conversations.find((c) => c.kind === 'assignment' && c.assignmentId === assignmentId),
    [conversations],
  )

  // New messages land at the end of the thread and float the conversation to the top of the list.
  const sendMessage = useCallback((conversationId: string, text: string) => {
    setConversations((prev) => {
      const target = prev.find((c) => c.id === conversationId)
      if (!target) return prev

      const updated: Conversation = {
        ...target,
        messages: [
          ...target.messages,
          { id: `m${Date.now()}`, from: 'me', text, minutesAgo: 0 },
        ],
      }
      return [updated, ...prev.filter((c) => c.id !== conversationId)]
    })
  }, [])

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId && c.unread > 0 ? { ...c, unread: 0 } : c)),
    )
  }, [])

  // Anything the signed-in user publishes is authored by them and lands at the top of the feed.
  const createPost = useCallback((input: Pick<Post, 'image' | 'alt' | 'caption'>) => {
    const post: Post = {
      ...input,
      id: `po${Date.now()}`,
      photographerId: currentUser.id,
      likes: 0,
      comments: 0,
      postedOn: toISO(new Date()),
    }
    setPosts((prev) => [post, ...prev])
    logActivity({ kind: 'post', title: 'Published a photo', detail: post.caption, to: '/profile/posts' })
    return post
  }, [logActivity])

  const createStory = useCallback((input: Pick<Story, 'image' | 'overlays' | 'drawing' | 'audience'>) => {
    const story: Story = {
      ...input,
      id: `st${Date.now()}`,
      photographerId: currentUser.id,
      minutesAgo: 0,
    }
    setStories((prev) => [story, ...prev])
    logActivity({ kind: 'story', title: 'Posted a story', to: '/story' })
    return story
  }, [logActivity])

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
  }, [])

  // Each of these is the user acting, so each one writes a line in their log.
  const toggleLikedPost = useCallback(
    (id: string) => {
      const author = getPhotographer(posts.find((p) => p.id === id)?.photographerId ?? '')
      setLikedPostIds((prev) => toggle(prev, id))
      logActivity({
        kind: 'like',
        title: `${likedPostIds.includes(id) ? 'Unliked' : 'Liked'} a photo by ${author?.name ?? 'someone'}`,
        to: '/',
      })
    },
    [likedPostIds, posts, getPhotographer, logActivity],
  )

  const toggleSavedPost = useCallback(
    (id: string) => {
      setSavedPostIds((prev) => toggle(prev, id))
      logActivity({
        kind: 'save',
        title: savedPostIds.includes(id) ? 'Removed a saved photo' : 'Saved a photo',
        to: '/saved?tab=posts',
      })
    },
    [savedPostIds, logActivity],
  )

  const toggleSaved = useCallback(
    (id: string) => {
      const target = getPhotographer(id)
      setSavedIds((prev) => toggle(prev, id))
      logActivity({
        kind: 'save',
        title: `${savedIds.includes(id) ? 'Unsaved' : 'Saved'} ${target?.name ?? 'a photographer'}`,
        to: `/photographer/${id}`,
      })
    },
    [savedIds, getPhotographer, logActivity],
  )

  const toggleFollowing = useCallback(
    (id: string) => {
      const target = getPhotographer(id)
      setFollowingIds((prev) => toggle(prev, id))
      logActivity({
        kind: 'follow',
        title: `${followingIds.includes(id) ? 'Unfollowed' : 'Followed'} ${target?.name ?? 'a photographer'}`,
        to: `/photographer/${id}`,
      })
    },
    [followingIds, getPhotographer, logActivity],
  )

  const value = useMemo<Store>(
    () => ({
      photographers,
      currentUser: profile,
      updateProfile,
      assignments,
      conversations,
      getConversation,
      openConversationWith,
      getAssignmentConversation,
      sendMessage,
      markConversationRead,
      posts,
      createPost,
      stories,
      createStory,
      likedPostIds,
      savedPostIds,
      toggleLikedPost,
      toggleSavedPost,
      savedIds,
      followingIds,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      getAssignment,
      canEditAssignment,
      addParticipant,
      removeParticipant,
      setParticipantRole,
      inviteStatus,
      respondToInvite,
      pendingInvites,
      assignmentsOn,
      dayStatus,
      setDayStatus,
      isDayLocked,
      toggleAssignmentApproval,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      toggleSaved,
      toggleFollowing,
      getPhotographer,
      activity,
      clearActivity,
      notificationPrefs,
      setNotificationPref,
      privacy,
      updatePrivacy,
      unblockPhotographer,
      verification,
      submitVerification,
      linkedAccounts,
      addAccount,
      signOut,
      searchOpen,
      openSearch,
      closeSearch,
    }),
    [
      profile,
      updateProfile,
      assignments,
      conversations,
      getConversation,
      openConversationWith,
      getAssignmentConversation,
      sendMessage,
      markConversationRead,
      posts,
      createPost,
      stories,
      createStory,
      likedPostIds,
      savedPostIds,
      toggleLikedPost,
      toggleSavedPost,
      savedIds,
      followingIds,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      getAssignment,
      canEditAssignment,
      addParticipant,
      removeParticipant,
      setParticipantRole,
      inviteStatus,
      respondToInvite,
      pendingInvites,
      assignmentsOn,
      dayStatus,
      setDayStatus,
      isDayLocked,
      toggleAssignmentApproval,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      toggleSaved,
      toggleFollowing,
      getPhotographer,
      activity,
      clearActivity,
      notificationPrefs,
      setNotificationPref,
      privacy,
      updatePrivacy,
      unblockPhotographer,
      verification,
      submitVerification,
      linkedAccounts,
      addAccount,
      signOut,
      searchOpen,
      openSearch,
      closeSearch,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
