"use client"

/**
 * QuickChat - Friend Context
 *
 * Manages friend requests and friendships between users.
 * Uses a global shared database in localStorage so all users can access each other's data.
 */

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { useAuth } from "./auth-context"

// Friend request status types
export type RequestStatus = "pending" | "accepted" | "rejected"

// Friend request interface
export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: RequestStatus
  createdAt: Date
}

// Friendship interface (accepted requests)
export interface Friendship {
  id: string
  user1Id: string
  user2Id: string
  createdAt: Date
}

interface FriendContextType {
  // State
  friendRequests: FriendRequest[]
  friendships: Friendship[]

  // Actions
  sendFriendRequest: (toUserId: string) => void
  acceptFriendRequest: (requestId: string) => void
  rejectFriendRequest: (requestId: string) => void
  cancelFriendRequest: (requestId: string) => void
  removeFriend: (friendshipId: string) => void

  // Helpers
  isFriend: (userId: string) => boolean
  hasPendingRequestTo: (userId: string) => boolean
  hasPendingRequestFrom: (userId: string) => boolean
  getRequestStatus: (userId: string) => "none" | "sent" | "received" | "friends"
  getIncomingRequests: () => FriendRequest[]
  getOutgoingRequests: () => FriendRequest[]
  getFriendIds: () => string[]
}

const FriendContext = createContext<FriendContextType | undefined>(undefined)

// Global database keys - shared by all users
const GLOBAL_REQUESTS_DB = "quickchat_all_requests_db"
const GLOBAL_FRIENDSHIPS_DB = "quickchat_all_friendships_db"
const POLL_INTERVAL = 1000 // Check for updates every second

// Helper functions to manage global database
const getAllRequestsFromDB = (): FriendRequest[] => {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(GLOBAL_REQUESTS_DB)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error("Error reading requests DB:", e)
    return []
  }
}

const getAllFriendshipsFromDB = (): Friendship[] => {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(GLOBAL_FRIENDSHIPS_DB)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error("Error reading friendships DB:", e)
    return []
  }
}

const saveRequestsToDB = (requests: FriendRequest[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GLOBAL_REQUESTS_DB, JSON.stringify(requests))
  } catch (e) {
    console.error("Error saving requests DB:", e)
  }
}

const saveFriendshipsToDB = (friendships: Friendship[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GLOBAL_FRIENDSHIPS_DB, JSON.stringify(friendships))
  } catch (e) {
    console.error("Error saving friendships DB:", e)
  }
}

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load relevant requests and friendships for current user from global DB
  const loadUserData = useCallback(() => {
    if (!user) return

    const allRequests = getAllRequestsFromDB()
    const allFriendships = getAllFriendshipsFromDB()

    // Filter requests relevant to this user
    const userRequests = allRequests.filter(
      (r) => r.fromUserId === user.id || r.toUserId === user.id
    )

    // Filter friendships relevant to this user
    const userFriendships = allFriendships.filter(
      (f) => f.user1Id === user.id || f.user2Id === user.id
    )

    setFriendRequests(userRequests)
    setFriendships(userFriendships)

    console.log("[Friend Context] Loaded data for user:", user.id, { userRequests, userFriendships })
  }, [user])

  // Load data when user changes
  useEffect(() => {
    loadUserData()
  }, [user, loadUserData])

  // Poll for changes every second
  useEffect(() => {
    if (!user) return

    pollTimerRef.current = setInterval(() => {
      loadUserData()
    }, POLL_INTERVAL)

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
    }
  }, [user, loadUserData])

  // Listen to storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GLOBAL_REQUESTS_DB || e.key === GLOBAL_FRIENDSHIPS_DB) {
        console.log("[Friend Context] Storage changed in another tab:", e.key)
        loadUserData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [loadUserData])

  const sendFriendRequest = useCallback(
    (toUserId: string) => {
      if (!user) {
        console.log("[Friend Context] Cannot send request - no user logged in")
        return
      }

      console.log("[Friend Context] Sending request from", user.id, "to", toUserId)

      const allRequests = getAllRequestsFromDB()

      // Check if request already exists
      const exists = allRequests.some(
        (r) =>
          (r.fromUserId === user.id && r.toUserId === toUserId) ||
          (r.fromUserId === toUserId && r.toUserId === user.id)
      )

      if (exists) {
        console.log("[Friend Context] Request already exists")
        return
      }

      // Check if already friends
      const allFriendships = getAllFriendshipsFromDB()
      const isFriends = allFriendships.some(
        (f) =>
          (f.user1Id === user.id && f.user2Id === toUserId) ||
          (f.user1Id === toUserId && f.user2Id === user.id)
      )

      if (isFriends) {
        console.log("[Friend Context] Already friends")
        return
      }

      const newRequest: FriendRequest = {
        id: `req-${Date.now()}`,
        fromUserId: user.id,
        toUserId,
        status: "pending",
        createdAt: new Date(),
      }

      const updatedRequests = [...allRequests, newRequest]
      saveRequestsToDB(updatedRequests)

      // Reload local state
      setFriendRequests((prev) => [...prev, newRequest])

      console.log("[Friend Context] Request sent:", newRequest)
    },
    [user]
  )

  const acceptFriendRequest = useCallback(
    (requestId: string) => {
      const allRequests = getAllRequestsFromDB()
      const request = allRequests.find((r) => r.id === requestId)

      if (!request || request.status !== "pending") return

      // Update request status
      const updatedRequests = allRequests.map((r) =>
        r.id === requestId ? { ...r, status: "accepted" as RequestStatus } : r
      )
      saveRequestsToDB(updatedRequests)

      // Add friendship
      const allFriendships = getAllFriendshipsFromDB()
      const newFriendship: Friendship = {
        id: `friend-${Date.now()}`,
        user1Id: request.fromUserId,
        user2Id: request.toUserId,
        createdAt: new Date(),
      }
      const updatedFriendships = [...allFriendships, newFriendship]
      saveFriendshipsToDB(updatedFriendships)

      // Reload local state
      setFriendRequests(updatedRequests.filter((r) => r.fromUserId === user?.id || r.toUserId === user?.id))
      setFriendships(updatedFriendships.filter((f) => f.user1Id === user?.id || f.user2Id === user?.id))

      console.log("[Friend Context] Request accepted:", requestId)
    },
    [user]
  )

  const rejectFriendRequest = useCallback(
    (requestId: string) => {
      const allRequests = getAllRequestsFromDB()
      const updatedRequests = allRequests.filter((r) => r.id !== requestId)
      saveRequestsToDB(updatedRequests)

      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId))
    },
    []
  )

  const cancelFriendRequest = useCallback(
    (requestId: string) => {
      const allRequests = getAllRequestsFromDB()
      const updatedRequests = allRequests.filter((r) => r.id !== requestId)
      saveRequestsToDB(updatedRequests)

      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId))
    },
    []
  )

  const removeFriend = useCallback(
    (friendshipId: string) => {
      const allFriendships = getAllFriendshipsFromDB()
      const updatedFriendships = allFriendships.filter((f) => f.id !== friendshipId)
      saveFriendshipsToDB(updatedFriendships)

      setFriendships((prev) => prev.filter((f) => f.id !== friendshipId))

      // Also remove associated request
      const friendship = allFriendships.find((f) => f.id === friendshipId)
      if (friendship) {
        const allRequests = getAllRequestsFromDB()
        const updatedRequests = allRequests.filter(
          (r) =>
            !(
              (r.fromUserId === friendship.user1Id && r.toUserId === friendship.user2Id) ||
              (r.fromUserId === friendship.user2Id && r.toUserId === friendship.user1Id)
            )
        )
        saveRequestsToDB(updatedRequests)
      }
    },
    []
  )

  const isFriend = useCallback(
    (userId: string): boolean => {
      if (!user) return false
      return friendships.some(
        (f) => (f.user1Id === user.id && f.user2Id === userId) || (f.user1Id === userId && f.user2Id === user.id)
      )
    },
    [user, friendships]
  )

  const hasPendingRequestTo = useCallback(
    (userId: string): boolean => {
      if (!user) return false
      return friendRequests.some(
        (r) => r.fromUserId === user.id && r.toUserId === userId && r.status === "pending"
      )
    },
    [user, friendRequests]
  )

  const hasPendingRequestFrom = useCallback(
    (userId: string): boolean => {
      if (!user) return false
      return friendRequests.some(
        (r) => r.fromUserId === userId && r.toUserId === user.id && r.status === "pending"
      )
    },
    [user, friendRequests]
  )

  const getRequestStatus = useCallback(
    (userId: string): "none" | "sent" | "received" | "friends" => {
      if (isFriend(userId)) return "friends"
      if (hasPendingRequestTo(userId)) return "sent"
      if (hasPendingRequestFrom(userId)) return "received"
      return "none"
    },
    [isFriend, hasPendingRequestTo, hasPendingRequestFrom]
  )

  const getIncomingRequests = useCallback((): FriendRequest[] => {
    if (!user) return []
    return friendRequests.filter((r) => r.toUserId === user.id && r.status === "pending")
  }, [user, friendRequests])

  const getOutgoingRequests = useCallback((): FriendRequest[] => {
    if (!user) return []
    return friendRequests.filter((r) => r.fromUserId === user.id && r.status === "pending")
  }, [user, friendRequests])

  const getFriendIds = useCallback((): string[] => {
    if (!user) return []
    return friendships.map((f) => (f.user1Id === user.id ? f.user2Id : f.user1Id))
  }, [user, friendships])

  const value: FriendContextType = {
    friendRequests,
    friendships,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    isFriend,
    hasPendingRequestTo,
    hasPendingRequestFrom,
    getRequestStatus,
    getIncomingRequests,
    getOutgoingRequests,
    getFriendIds,
  }

  return <FriendContext.Provider value={value}>{children}</FriendContext.Provider>
}

export function useFriend() {
  const context = useContext(FriendContext)
  if (context === undefined) {
    throw new Error("useFriend must be used within a FriendProvider")
  }
  return context
}
