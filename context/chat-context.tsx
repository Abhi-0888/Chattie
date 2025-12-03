"use client"

/**
 * QuickChat - Chat Context
 *
 * Manages all chat-related state including messages, active chats,
 * and chat operations. Structured for easy backend integration.
 */

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import { dummyChats, dummyMessages, type Chat, type Message } from "@/utils/dummy-chats"
import { getAllUsers, type User, DEFAULT_AVATAR } from "@/utils/dummy-users"
import { useAuth } from "./auth-context"

const STORAGE_KEYS = {
  CHATS: "quickchat_chats",
  MESSAGES: "quickchat_messages",
  MIGRATION_V2: "quickchat_migrated_v2", // Flag to track migration
}

function getStoredChats(): Chat[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHATS)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((chat: Chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        lastMessage: chat.lastMessage
          ? { ...chat.lastMessage, timestamp: new Date(chat.lastMessage.timestamp) }
          : undefined,
      }))
    }
  } catch (e) {
    console.error("[Chat Context] Error reading chats from localStorage:", e)
  }
  return []
}

function getStoredMessages(): Message[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    }
  } catch (e) {
    console.error("[Chat Context] Error reading messages from localStorage:", e)
  }
  return []
}

function saveChatsToStorage(chats: Chat[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats))
  } catch (e) {
    console.error("[Chat Context] Error saving chats to localStorage:", e)
  }
}

function saveMessagesToStorage(messages: Message[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  } catch (e) {
    console.error("[Chat Context] Error saving messages to localStorage:", e)
  }
}

/**
 * Remove duplicate chats. For group chats, dedupe by group name so
 * there is only one group with the same name. For other chats, keep
 * the first occurrence.
 */
function dedupeChats(chats: Chat[]): Chat[] {
  const seen = new Set<string>()
  const out: Chat[] = []

  for (const c of chats) {
    const key = c.type === "group" && c.name ? `group:${c.name}` : `chat:${c.id}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push(c)
    }
  }

  return out
}

interface ChatContextType {
  // State
  chats: Chat[]
  messages: Message[]
  selectedChat: Chat | null
  typingUsers: { [chatId: string]: string[] }

  // Actions
  selectChat: (chatId: string) => void
  sendMessage: (content: string) => void
  createGroupChat: (name: string, participantIds: string[]) => void
  createDirectChat: (userId: string) => void
  removeUserFromChat: (chatId: string, userId: string) => void
  deleteChat: (chatId: string) => void
  editChat: (chatId: string, updates: Partial<Pick<Chat, "name" | "avatar" | "participants">>) => void
  markAsRead: (chatId: string) => void
  setTyping: (chatId: string, isTyping: boolean) => void

  // Helpers
  getChatName: (chat: Chat) => string
  getChatAvatar: (chat: Chat) => string
  getOtherParticipant: (chat: Chat) => User | undefined
  availableUsers: User[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({})
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Migration: Clear old persisted chats on first load (v2)
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEYS.MIGRATION_V2)) {
      localStorage.removeItem(STORAGE_KEYS.CHATS)
      localStorage.removeItem(STORAGE_KEYS.MESSAGES)
      localStorage.setItem(STORAGE_KEYS.MIGRATION_V2, "true")
      console.log("[Chat Context] Cleared old persisted chats (migration v2)")
    }

    const storedChats = getStoredChats()
    const storedMessages = getStoredMessages()

    // Start with only user-created chats (no seed data)
    const cleaned = dedupeChats(storedChats)
    setChats(cleaned)
    if (cleaned.length !== storedChats.length) saveChatsToStorage(cleaned)

    setMessages(storedMessages)

    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!user || !isInitialized) return

    const refreshData = () => {
      const storedChats = getStoredChats()
      const storedMessages = getStoredMessages()

      if (storedChats.length > 0) {
        const cleaned = dedupeChats(storedChats)
        setChats(cleaned)
        if (cleaned.length !== storedChats.length) saveChatsToStorage(cleaned)
      }
      if (storedMessages.length > 0) {
        setMessages(storedMessages)
      }
    }

    // Refresh immediately
    refreshData()

    const interval = setInterval(refreshData, 2000)

    return () => clearInterval(interval)
  }, [user, isInitialized])

  useEffect(() => {
    // Initial load
    setAllUsers(getAllUsers())

    // Poll for new users every 2 seconds
    const interval = setInterval(() => {
      setAllUsers(getAllUsers())
    }, 2000)

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    setAllUsers(getAllUsers())
  }, [user])

  /**
   * Select a chat and load its messages
   */
  const selectChat = useCallback(
    (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId)
      if (chat) {
        setSelectedChat(chat)
        // Mark messages as read
        setChats((prev) => {
          const updated = prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
          saveChatsToStorage(updated)
          return updated
        })
      }
    },
    [chats],
  )

  /**
   * Send a new message in the selected chat
   */
  const sendMessage = useCallback(
    (content: string) => {
      if (!selectedChat || !user || !content.trim()) return

      const newMessage: Message = {
        id: `msg-${Date.now()}-${user.id}`,
        chatId: selectedChat.id,
        senderId: user.id,
        content: content.trim(),
        timestamp: new Date(),
        status: "sent",
      }

      setMessages((prev) => {
        const updated = [...prev, newMessage]
        saveMessagesToStorage(updated)
        return updated
      })

      setChats((prev) => {
        const updated = prev.map((chat) => {
          if (chat.id === selectedChat.id) {
            return {
              ...chat,
              lastMessage: newMessage,
              // Increment unread count for the recipient
              unreadCount: 0,
            }
          }
          return chat
        })
        saveChatsToStorage(updated)
        return updated
      })

      // Simulate message delivery status update
      setTimeout(() => {
        setMessages((prev) => {
          const updated = prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg))
          saveMessagesToStorage(updated)
          return updated
        })
      }, 1000)

      // Simulate read status
      setTimeout(() => {
        setMessages((prev) => {
          const updated = prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "read" } : msg))
          saveMessagesToStorage(updated)
          return updated
        })
      }, 2000)
    },
    [selectedChat, user],
  )

  /**
   * Create a new group chat
   */
  const createGroupChat = useCallback(
    (name: string, participantIds: string[]) => {
      if (!user) return

      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        type: "group",
        name,
        avatar: DEFAULT_AVATAR,
        participants: [user.id, ...participantIds],
        unreadCount: 0,
        createdAt: new Date(),
      }

      setChats((prev) => {
        const updated = [newChat, ...prev]
        saveChatsToStorage(updated)
        return updated
      })
      setSelectedChat(newChat)
    },
    [user],
  )

  /**
   * Create or open a direct chat with a user
   */
  const createDirectChat = useCallback(
    (userId: string) => {
      if (!user) return

      const latestChats = getStoredChats()
      const existingChat = latestChats.find(
        (chat) => chat.type === "direct" && chat.participants.includes(user.id) && chat.participants.includes(userId),
      )

      if (existingChat) {
        setChats(latestChats)
        setSelectedChat(existingChat)
        return
      }

      const newChat: Chat = {
        id: `chat-${Date.now()}-${user.id}-${userId}`,
        type: "direct",
        participants: [user.id, userId],
        unreadCount: 0,
        createdAt: new Date(),
      }

      const updatedChats = [newChat, ...latestChats]
      saveChatsToStorage(updatedChats)
      setChats(updatedChats)
      setSelectedChat(newChat)
    },
    [user],
  )

  /**
   * Mark all messages in a chat as read
   */
  const markAsRead = useCallback((chatId: string) => {
    setChats((prev) => {
      const updated = prev.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat))
      saveChatsToStorage(updated)
      return updated
    })
  }, [])

  /**
   * Remove a user from a chat. If after removal the chat has fewer than
   * 2 participants, the chat will be deleted.
   */
  const removeUserFromChat = useCallback(
    (chatId: string, userId: string) => {
      setChats((prev) => {
        const updated: Chat[] = []
        for (const c of prev) {
          if (c.id === chatId) {
            const participants = c.participants.filter((p) => p !== userId)
            if (participants.length < 2) {
              // skip adding -> effectively delete the chat
              continue
            }
            updated.push({ ...c, participants })
          } else {
            updated.push(c)
          }
        }
        saveChatsToStorage(updated)

        // If the selected chat was modified/removed, update selectedChat
        if (selectedChat?.id === chatId) {
          const found = updated.find((ch) => ch.id === chatId)
          if (found) setSelectedChat(found)
          else setSelectedChat(null)
        }

        return updated
      })
    },
    [selectedChat],
  )

  /** Delete a chat and its messages */
  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => {
        const updated = prev.filter((c) => c.id !== chatId)
        saveChatsToStorage(updated)
        return updated
      })

      setMessages((prev) => {
        const updated = prev.filter((m) => m.chatId !== chatId)
        saveMessagesToStorage(updated)
        return updated
      })

      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
      }
    },
    [selectedChat],
  )

  /** Edit chat metadata (name, avatar, participants) */
  const editChat = useCallback(
    (chatId: string, updates: Partial<Pick<Chat, "name" | "avatar" | "participants">>) => {
      setChats((prev) => {
        const updated = prev.map((c) => (c.id === chatId ? { ...c, ...updates } : c))
        saveChatsToStorage(updated)
        return updated
      })

      if (selectedChat?.id === chatId) {
        const latest = getStoredChats().find((c) => c.id === chatId) || null
        setSelectedChat(latest)
      }
    },
    [selectedChat],
  )

  /**
   * Set typing indicator for current user in a chat
   */
  const setTyping = useCallback(
    (chatId: string, isTyping: boolean) => {
      if (!user) return

      setTypingUsers((prev) => {
        const currentTyping = prev[chatId] || []
        if (isTyping && !currentTyping.includes(user.id)) {
          return { ...prev, [chatId]: [...currentTyping, user.id] }
        } else if (!isTyping) {
          return { ...prev, [chatId]: currentTyping.filter((id) => id !== user.id) }
        }
        return prev
      })
    },
    [user],
  )

  /**
   * Get display name for a chat
   */
  const getChatName = useCallback(
    (chat: Chat): string => {
      if (chat.type === "group") {
        return chat.name || "Group Chat"
      }

      const otherUserId = chat.participants.find((id) => id !== user?.id)
      const otherUser = allUsers.find((u) => u.id === otherUserId)
      return otherUser?.name || "Unknown User"
    },
    [user, allUsers],
  )

  /**
   * Get avatar for a chat
   */
  const getChatAvatar = useCallback(
    (chat: Chat): string => {
      if (chat.type === "group" && chat.avatar) {
        return chat.avatar
      }

      const otherUserId = chat.participants.find((id) => id !== user?.id)
      const otherUser = allUsers.find((u) => u.id === otherUserId)
      return otherUser?.avatar || "/default-avatar.png"
    },
    [user, allUsers],
  )

  /**
   * Get the other participant in a direct chat
   */
  const getOtherParticipant = useCallback(
    (chat: Chat): User | undefined => {
      if (chat.type !== "direct") return undefined
      const otherUserId = chat.participants.find((id) => id !== user?.id)
      return allUsers.find((u) => u.id === otherUserId)
    },
    [user, allUsers],
  )

  /**
   * Get users available for new chats (excludes current user)
   * Now includes registered users from localStorage
   */
  const availableUsers = useMemo(() => {
    if (!user) return []
    return allUsers.filter((u) => u.id !== user.id)
  }, [user, allUsers])

  const value: ChatContextType = {
    chats,
    messages,
    selectedChat,
    typingUsers,
    selectChat,
    sendMessage,
    createGroupChat,
    createDirectChat,
    markAsRead,
    setTyping,
    getChatName,
    getChatAvatar,
    getOtherParticipant,
    availableUsers,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

/**
 * Custom hook to access chat context
 */
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
