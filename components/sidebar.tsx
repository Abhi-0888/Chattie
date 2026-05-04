"use client"

/**
 * QuickChat - Sidebar Component
 *
 * Main navigation sidebar showing chat list, user profile,
 * and actions for creating new chats.
 */

import { useState } from "react"
import { Search, Plus, LogOut, Users, MessageSquare, UserPlus, Keyboard, CheckCheck, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { useChat } from "@/context/chat-context"
import { useSocket } from "@/context/socket-context"
import { useFriend } from "@/context/friend-context"
import { formatDistanceToNow } from "date-fns"
import { UserList } from "./user-list"
import { FriendRequests } from "./friend-requests"
import { GroupCreationModal } from "./group-creation-modal"
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal"

interface SidebarProps {
  onMobileClose?: () => void
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { chats, selectedChat, selectChat, getChatName, getChatAvatar, getOtherParticipant, markAllAsRead, exportChat } = useChat()
  const { isConnected } = useSocket()
  const { getIncomingRequests } = useFriend()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"chats" | "users" | "requests">("chats")
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Calculate total unread
  const totalUnreadCount = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-sidebar)] border-r border-[var(--color-border)]">
      {/* Header with glass effect and mesh gradient */}
      <div className="mesh-gradient p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isConnected ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
                  }`}
              />
            </motion.div>
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <h2 className="font-bold text-white leading-tight">{user?.name}</h2>
              <p className="text-xs text-white/80">{isConnected ? "Online" : "Connecting..."}</p>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-95 bg-white/10"
              title="New Group"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-95 bg-white/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input
            type="text"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="modern-input w-full pl-10 pr-4 py-2.5 bg-[var(--color-input)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all border-transparent"
          />
        </div>
      </div>

      {/* Quick Actions */}
      {totalUnreadCount > 0 && (
        <div className="px-4 mb-2">
          <button
            onClick={() => markAllAsRead()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-lg transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read ({totalUnreadCount})
          </button>
        </div>
      )}

      {/* Tabs with modern transition */}
      <div className="flex border-b border-[var(--color-border)] gap-0 px-2 bg-[var(--color-secondary)]/10 mx-4 rounded-xl mb-2">
        {(["chats", "users", "requests"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 rounded-lg relative my-1 ${activeTab === tab
              ? "text-white"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#ec4899] rounded-lg shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab === "chats" && <MessageSquare className="w-3.5 h-3.5" />}
              {tab === "users" && <Users className="w-3.5 h-3.5" />}
              {tab === "requests" && <UserPlus className="w-3.5 h-3.5" />}
              <span className="capitalize">{tab}</span>
              {tab === "requests" && incomingRequestsCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {incomingRequestsCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Content with AnimatePresence */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "chats" ? (
            <motion.div
              key="chats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -10 }}
              className="space-y-1 p-2"
            >
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
                    <motion.button
                      key={chat.id}
                      variants={itemVariants}
                      onClick={() => handleChatSelect(chat.id)}
                      className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group ${isSelected
                        ? "bg-white dark:bg-white/10 shadow-lg border border-[var(--color-primary)]/20"
                        : "hover:bg-white/50 dark:hover:bg-white/5"
                        }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={getChatAvatar(chat) || "/default-avatar.png"}
                          alt={getChatName(chat)}
                          className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                        />
                        {chat.type === "direct" && otherUser && (
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${otherUser.status === "online" ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
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
                          <h3 className="font-semibold text-[var(--color-foreground)] truncate text-sm">{getChatName(chat)}</h3>
                          {chat.lastMessage && (
                            <span className="text-[10px] text-[var(--color-muted)] ml-2 flex-shrink-0">
                              {formatDistanceToNow(new Date(chat.lastMessage.timestamp), {
                                addSuffix: false,
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                            {chat.lastMessage?.content || "No messages yet"}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-[#6366f1] to-[#ec4899] rounded-full shadow-md flex-shrink-0">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })
              )}
            </motion.div>
          ) : activeTab === "users" ? (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <UserList onMobileClose={onMobileClose} />
            </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <FriendRequests onMobileClose={onMobileClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Group Creation Modal */}
      <GroupCreationModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-secondary)]/20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] rounded-lg transition-colors"
            title="Keyboard shortcuts (Ctrl+?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
          {selectedChat && (
            <button
              onClick={() => exportChat(selectedChat.id)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
              title="Export this chat"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
