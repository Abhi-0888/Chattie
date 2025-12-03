export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

export interface Chat {
  id: string
  type: "direct" | "group"
  name?: string // For group chats
  avatar?: string // For group chats
  participants: string[] // User IDs
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
}

// Generate timestamps relative to now
const now = new Date()
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000)
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3600000)

export const dummyMessages: Message[] = []

export const dummyChats: Chat[] = []

/**
 * Get messages for a specific chat
 */
export const getMessagesByChatId = (chatId: string): Message[] => {
  return dummyMessages.filter((msg) => msg.chatId === chatId)
}

/**
 * Get chat by ID
 */
export const getChatById = (id: string): Chat | undefined => {
  return dummyChats.find((chat) => chat.id === id)
}
