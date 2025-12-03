"use client"

/**
 * QuickChat - Sidebar Component
 *
 * Main navigation sidebar showing chat list, user profile,
 * and actions for creating new chats.
 */

import { useState } from "react"
import { Search, Plus, LogOut, Users, MessageSquare, UserPlus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useChat } from "@/context/chat-context"
import { useSocket } from "@/context/socket-context"
import { useFriend } from "@/context/friend-context"
import { formatDistanceToNow } from "date-fns"
import { UserList } from "./user-list"
import { FriendRequests } from "./friend-requests"
import { GroupCreationModal } from "./group-creation-modal"

interface SidebarProps {
  onMobileClose?: () => void
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { chats, selectedChat, selectChat, getChatName, getChatAvatar, getOtherParticipant } = useChat()
  const { isConnected } = useSocket()
  const { getIncomingRequests } = useFriend()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"chats" | "users" | "requests">("chats")
  const [showGroupModal, setShowGroupModal] = useState(false)

  // Get incoming requests count for badge
  const incomingRequestsCount = getIncomingRequests().length

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase()))

  // Sort chats by last message timestamp
  const sortedChats = [...filteredChats].sort((a, b) => {
    const aTime = a.lastMessage?.timestamp || a.createdAt
    const bTime = b.lastMessage?.timestamp || b.createdAt
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId)
    onMobileClose?.()
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-sidebar)] border-r border-[var(--color-border)]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isConnected ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
                }`}
              />
            </div>
            <div>
              <h2 className="font-bold text-white">{user?.name}</h2>
              <p className="text-xs text-white/80">{isConnected ? "Online" : "Connecting..."}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-95"
              title="New Group"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-95"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="modern-input w-full pl-10 pr-4 py-2.5 bg-[var(--color-input)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-opacity-20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] gap-0 px-2">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 rounded-t-lg ${
            activeTab === "chats"
              ? "text-white bg-gradient-to-r from-[#6366f1] to-[#ec4899]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chats
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 rounded-t-lg ${
            activeTab === "users"
              ? "text-white bg-gradient-to-r from-[#6366f1] to-[#ec4899]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
          }`}
        >
          <Users className="w-4 h-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 rounded-t-lg relative ${
            activeTab === "requests"
              ? "text-white bg-gradient-to-r from-[#6366f1] to-[#ec4899]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Requests
          {incomingRequestsCount > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse">
              {incomingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "chats" ? (
          <div className="space-y-1 p-2">
            {sortedChats.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-muted)]">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No chats yet</p>
                <p className="text-sm mt-1">Add friends to start chatting!</p>
              </div>
            ) : (
              sortedChats.map((chat) => {
                const otherUser = getOtherParticipant(chat)
                const isSelected = selectedChat?.id === chat.id

                return (
                  <button
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                    className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all duration-200 group ${
                      isSelected
                        ? "sidebar-item-active shadow-md"
                        : "hover:bg-[var(--color-secondary)] hover:shadow-sm"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={getChatAvatar(chat) || "/default-avatar.png"}
                        alt={getChatName(chat)}
                        className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      {chat.type === "direct" && otherUser && (
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            otherUser.status === "online" ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
                          } shadow-md`}
                        />
                      )}
                      {chat.type === "group" && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center shadow-md">
                          <Users className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--color-foreground)] truncate">{getChatName(chat)}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-[var(--color-muted)] ml-2 flex-shrink-0">
                            {formatDistanceToNow(new Date(chat.lastMessage.timestamp), {
                              addSuffix: false,
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-[var(--color-muted-foreground)] truncate">
                          {chat.lastMessage?.content || "No messages yet"}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="ml-2 px-2.5 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-[#6366f1] to-[#ec4899] rounded-full shadow-md flex-shrink-0">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        ) : activeTab === "users" ? (
          <UserList onMobileClose={onMobileClose} />
        ) : (
          <FriendRequests onMobileClose={onMobileClose} />
        )}
      </div>

      {/* Group Creation Modal */}
      <GroupCreationModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} />
    </div>
  )
}
