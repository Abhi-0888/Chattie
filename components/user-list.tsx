"use client"

import { useChat } from "@/context/chat-context"
import { useFriend } from "@/context/friend-context"
import { UserPlus, Clock, Check, MessageSquare, X, CheckCircle } from "lucide-react"
import { useState } from "react"

interface UserListProps {
  onMobileClose?: () => void
}

export function UserList({ onMobileClose }: UserListProps) {
  const { availableUsers, createDirectChat } = useChat()
  const { getRequestStatus, sendFriendRequest, cancelFriendRequest, getOutgoingRequests } = useFriend()
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type })
    // Also show browser alert so user definitely sees it
    alert(message)
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSendRequest = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId)
    sendFriendRequest(userId)
    showNotification(`Friend request sent to ${user?.name || "user"}!`, "success")
  }

  const handleCancelRequest = (userId: string) => {
    const outgoing = getOutgoingRequests()
    const request = outgoing.find((r) => r.toUserId === userId)
    if (request) {
      cancelFriendRequest(request.id)
      showNotification("Friend request cancelled", "success")
    }
  }

  const handleStartChat = (userId: string) => {
    createDirectChat(userId)
    onMobileClose?.()
  }

  // Group users by online status
  const onlineUsers = availableUsers.filter((u) => u.status === "online")
  const offlineUsers = availableUsers.filter((u) => u.status !== "online")

  const renderUserAction = (userId: string) => {
    const status = getRequestStatus(userId)

    switch (status) {
      case "friends":
        return (
          <button
            onClick={() => handleStartChat(userId)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white rounded-full text-xs font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        )
      case "sent":
        return (
          <button
            onClick={() => handleCancelRequest(userId)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-muted-foreground)] rounded-full text-xs font-bold hover:bg-red-100 hover:text-red-600 transition-all duration-200 group"
          >
            <Clock className="w-4 h-4 group-hover:hidden" />
            <X className="w-4 h-4 hidden group-hover:block" />
            <span className="group-hover:hidden">Pending</span>
            <span className="hidden group-hover:block">Cancel</span>
          </button>
        )
      case "received":
        return (
          <span className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 rounded-full text-xs font-bold">
            <Check className="w-4 h-4" />
            Respond
          </span>
        )
      default:
        return (
          <button
            onClick={() => handleSendRequest(userId)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#ec4899] to-[#f472b6] text-white rounded-full text-xs font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        )
    }
  }

  const renderUserSection = (users: typeof availableUsers, title: string, isOnline: boolean) => {
    if (users.length === 0) return null

    return (
      <div>
        <div className="px-4 py-3 bg-gradient-to-r from-[var(--color-secondary)] to-transparent border-b border-[var(--color-border)]">
          <h4 className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#10b981]' : 'bg-[var(--color-offline)]'} animate-pulse`} />
            {title} — <span className="font-black">{users.length}</span>
          </h4>
        </div>
        <div className="space-y-1 p-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-[var(--color-secondary)] transition-all duration-200 group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    isOnline ? "bg-[#10b981]" : "bg-[var(--color-offline)]"
                  } shadow-md`}
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-[var(--color-foreground)]">{user.name}</h3>
                <p className={`text-xs font-medium ${isOnline ? "text-[#10b981]" : "text-[var(--color-muted)]"}`}>
                  {isOnline ? "● Online" : user.lastSeen ? `Last seen ${user.lastSeen}` : "● Offline"}
                </p>
              </div>
              {renderUserAction(user.id)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {notification && (
        <div
          className={`p-4 flex items-center gap-3 backdrop-blur-sm border-b font-bold animate-slideDown ${
            notification.type === "success" ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30" : "bg-red-500/15 text-red-600 border-red-500/30"
          }`}
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {availableUsers.length === 0 ? (
        <div className="p-12 text-center text-[var(--color-muted)]">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <p className="font-semibold mb-1">No users found</p>
          <p className="text-sm">Invite friends to start connecting!</p>
        </div>
      ) : (
        <>
          {renderUserSection(onlineUsers, "Online", true)}
          {renderUserSection(offlineUsers, "Offline", false)}
        </>
      )}
    </div>
  )
}
