"use client"

/**
 * QuickChat - Friend Requests Component
 *
 * Displays incoming and outgoing friend requests with accept/reject actions.
 */

import { useFriend } from "@/context/friend-context"
import { useChat } from "@/context/chat-context"
import { useAuth } from "@/context/auth-context"
import { Check, X, Clock, UserPlus, Send } from "lucide-react"
import { useEffect, useState } from "react"
import { getAllUsers, type User } from "@/utils/dummy-users"

interface FriendRequestsProps {
  onMobileClose?: () => void
}

export function FriendRequests({ onMobileClose }: FriendRequestsProps) {
  const { user } = useAuth()
  const {
    getIncomingRequests,
    getOutgoingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    friendRequests,
  } = useFriend()
  const { availableUsers } = useChat()

  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    // Refresh users list every second to ensure we have latest registered users
    const refreshUsers = () => {
      setAllUsers(getAllUsers())
    }
    refreshUsers()
    const interval = setInterval(refreshUsers, 1000)
    return () => clearInterval(interval)
  }, [])

  const incomingRequests = getIncomingRequests()
  const outgoingRequests = getOutgoingRequests()

  const getUserById = (userId: string) => {
    // First check allUsers, then fall back to availableUsers
    return allUsers.find((u) => u.id === userId) || availableUsers.find((u) => u.id === userId)
  }

  const handleAccept = (requestId: string) => {
    acceptFriendRequest(requestId)
  }

  const handleReject = (requestId: string) => {
    rejectFriendRequest(requestId)
  }

  const handleCancel = (requestId: string) => {
    cancelFriendRequest(requestId)
  }

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--color-muted)]">
        <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No friend requests</p>
        <p className="text-sm mt-1">Send requests from the Users tab</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-[var(--color-secondary)]">
            <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide flex items-center gap-2">
              <UserPlus className="w-3.5 h-3.5" />
              Incoming Requests — {incomingRequests.length}
            </h4>
          </div>
          {incomingRequests.map((request) => {
            const fromUser = getUserById(request.fromUserId)

            return (
              <div
                key={request.id}
                className="p-3 flex items-center gap-3 hover:bg-[var(--color-secondary)] transition-colors"
              >
                <div className="relative">
                    <img
                      src={fromUser?.avatar || "/default-avatar.png"}
                      alt={fromUser?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      fromUser?.status === "online" ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--color-foreground)]">{fromUser?.name || "Unknown User"}</h3>
                  <p className="text-xs text-[var(--color-muted)]">Wants to connect with you</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="p-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-hover)] transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="p-2 bg-[var(--color-muted)] text-[var(--color-muted-foreground)] rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-[var(--color-secondary)]">
            <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              Sent Requests — {outgoingRequests.length}
            </h4>
          </div>
          {outgoingRequests.map((request) => {
            const toUser = getUserById(request.toUserId)

            return (
              <div
                key={request.id}
                className="p-3 flex items-center gap-3 hover:bg-[var(--color-secondary)] transition-colors"
              >
                <div className="relative">
                    <img
                      src={toUser?.avatar || "/default-avatar.png"}
                      alt={toUser?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      toUser?.status === "online" ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--color-foreground)]">{toUser?.name || "Unknown User"}</h3>
                  <p className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Awaiting response
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(request.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-muted)] text-[var(--color-muted-foreground)] rounded-full text-xs font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
