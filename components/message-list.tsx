"use client"

/**
 * QuickChat - Message List Component
 *
 * Displays messages in a chat with proper styling for sent/received messages.
 * Features auto-scroll and message status indicators.
 */

import { useEffect, useRef, useState } from "react"
import { Check, CheckCheck, Pin, Share2, File, Download, Image as ImageIcon, ArrowDown, CornerUpLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@/context/chat-context"
import { useAuth } from "@/context/auth-context"
import { dummyUsers } from "@/utils/dummy-users"
import { format, isToday, isYesterday, differenceInMinutes } from "date-fns"
import { MessageReactions } from "./message-reactions"
import { MessageContextMenu } from "./message-context-menu"
import { PinnedMessages } from "./pinned-messages"
import { LinkPreview } from "./link-preview"

// Regex to detect URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g

export function MessageList() {
  const { selectedChat, messages, editMessage, setReplyingTo } = useChat()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    show: boolean
    x: number
    y: number
    messageId: string
    isOwn: boolean
    isPinned: boolean
  }>({ show: false, x: 0, y: 0, messageId: "", isOwn: false, isPinned: false })
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  // Filter messages for selected chat
  const chatMessages = messages.filter((msg) => msg.chatId === selectedChat?.id)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages.length])

  // Handle scroll to show/hide "scroll to bottom" button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollBottom(!isAtBottom)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return format(new Date(date), "HH:mm")
  }

  // Format date separator
  const formatDateSeparator = (date: Date) => {
    const d = new Date(date)
    if (isToday(d)) return "Today"
    if (isYesterday(d)) return "Yesterday"
    return format(d, "MMMM d, yyyy")
  }

  // Group messages by date AND sender sequence
  const groupedMessages: { date: string; messageGroups: { senderId: string; messages: typeof chatMessages }[] }[] = []
  let currentDate = ""

  chatMessages.forEach((msg) => {
    const msgDate = formatDateSeparator(msg.timestamp)
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({
        date: msgDate,
        messageGroups: [{ senderId: msg.senderId, messages: [msg] }]
      })
    } else {
      const currentDay = groupedMessages[groupedMessages.length - 1]
      const currentGroup = currentDay.messageGroups[currentDay.messageGroups.length - 1]

      const lastMsg = currentGroup.messages[currentGroup.messages.length - 1]
      const timeDiff = differenceInMinutes(new Date(msg.timestamp), new Date(lastMsg.timestamp))

      if (currentGroup.senderId === msg.senderId && timeDiff < 5) {
        currentGroup.messages.push(msg)
      } else {
        currentDay.messageGroups.push({ senderId: msg.senderId, messages: [msg] })
      }
    }
  })

  // Get message status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3.5 h-3.5 text-[var(--color-muted)]" />
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-[var(--color-muted)]" />
      case "read":
        return <CheckCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
      default:
        return null
    }
  }

  if (!selectedChat) return null

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 chat-background relative"
        style={{
          backgroundImage: selectedChat.wallpaper ? `url(${selectedChat.wallpaper})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {selectedChat.wallpaper && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-[var(--color-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-foreground)] mb-1">No messages yet</h3>
            <p className="text-sm text-[var(--color-muted)]">Send a message to start the conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {groupedMessages.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-4">
                {/* Date separator */}
                <div className="flex items-center justify-center my-6">
                  <span className="px-4 py-1 text-xs font-bold text-[var(--color-muted-foreground)] bg-white dark:bg-white/10 rounded-full shadow-sm glass-effect">
                    {day.date}
                  </span>
                </div>

                {/* Message Groups */}
                {day.messageGroups.map((group, groupIndex) => {
                  const isSent = group.senderId === user?.id
                  const sender = dummyUsers.find((u) => u.id === group.senderId)
                  const isGroupChat = selectedChat.type === "group"

                  return (
                    <div
                      key={groupIndex}
                      className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[85%] ${isSent ? "ml-auto" : "mr-auto"}`}
                    >
                      {/* Sender name for group chats */}
                      {isGroupChat && !isSent && (
                        <span className="text-[11px] font-bold text-[#a78bfa] mb-1 ml-4">
                          {sender?.name || "Unknown"}
                        </span>
                      )}

                      <div className={`space-y-0.5 w-full flex flex-col ${isSent ? "items-end" : "items-start"}`}>
                        {group.messages.map((message, msgIndex) => {
                          const isFirst = msgIndex === 0
                          const isLast = msgIndex === group.messages.length - 1

                          return (
                            <motion.div
                              key={message.id}
                              initial={{ scale: 0.8, opacity: 0, y: 10 }}
                              animate={{ scale: 1, opacity: 1, y: 0 }}
                              className="relative group"
                              onContextMenu={(e) => {
                                e.preventDefault()
                                setContextMenu({
                                  show: true,
                                  x: e.clientX,
                                  y: e.clientY,
                                  messageId: message.id,
                                  isOwn: isSent,
                                  isPinned: !!message.isPinned
                                })
                              }}
                            >
                              <div
                                className={`message-bubble relative transition-all duration-200 ${isSent ? "sent" : "received"} px-4 py-2.5 ${isSent
                                  ? `text-white ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl rounded-l-2xl" : "rounded-l-2xl"} ${group.messages.length === 1 ? "rounded-2xl rounded-br-none" : ""}`
                                  : `text-[var(--color-foreground)] ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl rounded-r-2xl" : "rounded-r-2xl"} ${group.messages.length === 1 ? "rounded-2xl rounded-bl-none" : ""}`
                                  } ${message.isPinned ? "ring-2 ring-[var(--color-primary)]/30" : ""}`}
                              >
                                {/* Pinned Indicator */}
                                {message.isPinned && (
                                  <div className="absolute -top-1.5 -right-1.5 bg-[var(--color-primary)] text-white p-0.5 rounded-full shadow-sm z-10">
                                    <Pin className="w-2.5 h-2.5" />
                                  </div>
                                )}

                                {/* Reply Preview */}
                                {message.replyTo && (
                                  <div className={`flex items-start gap-1.5 mb-2 p-2 rounded-lg ${isSent ? "bg-white/10" : "bg-[var(--color-primary)]/10"}`}>
                                    <CornerUpLeft className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isSent ? "text-white/70" : "text-[var(--color-primary)]"}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-[10px] font-semibold ${isSent ? "text-white/70" : "text-[var(--color-primary)]"}`}>
                                        {message.replyTo.senderName}
                                      </p>
                                      <p className={`text-xs truncate ${isSent ? "text-white/80" : "text-[var(--color-muted-foreground)]"}`}>
                                        {message.replyTo.content || 'Media'}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Forwarded Indicator */}
                                {message.forwarded && (
                                  <div className="flex items-center gap-1 mb-1 opacity-60">
                                    <Share2 className="w-2.5 h-2.5 italic" />
                                    <span className="text-[9px] italic font-medium">Forwarded</span>
                                  </div>
                                )}

                                {/* Message content */}
                                {editingMessageId === message.id ? (
                                  <div className="flex flex-col gap-2 min-w-[200px]">
                                    <textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      className="bg-black/10 text-inherit text-sm p-2 rounded-lg border border-white/20 focus:outline-none min-h-[60px] resize-none"
                                      autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setEditingMessageId(null)}
                                        className="px-2 py-1 text-[10px] bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          editMessage(message.id, editContent)
                                          setEditingMessageId(null)
                                        }}
                                        className="px-2 py-1 text-[10px] bg-white text-[var(--color-primary)] font-bold rounded-md transition-colors"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {/* Media Content */}
                                    {message.fileUrl && (
                                      <div className="mb-2">
                                        {message.fileType === "image" ? (
                                          <div className="relative group/media">
                                            <img
                                              src={message.fileUrl}
                                              alt={message.fileName || "Image"}
                                              className="max-w-full rounded-xl shadow-sm border border-white/10 transition-transform duration-300 group-hover/media:scale-[1.01]"
                                            />
                                            <a
                                              href={message.fileUrl}
                                              download={message.fileName}
                                              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity rounded-xl"
                                            >
                                              <Download className="w-8 h-8 text-white" />
                                            </a>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-3 p-3 bg-black/5 rounded-xl border border-white/10 hover:bg-black/10 transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center">
                                              <File className="w-5 h-5 text-[var(--color-primary)]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate">{message.fileName || "File"}</p>
                                              <p className="text-[10px] opacity-70 uppercase font-bold tracking-tight">Attachment</p>
                                            </div>
                                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                              <Download className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Text Content */}
                                    {message.content && (
                                      <div className="relative">
                                        <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${isSent ? "text-white" : "text-[var(--color-foreground)]"}`}>
                                          {message.content}
                                          {message.editedAt && (
                                            <span className="ml-1 text-[9px] opacity-50 font-normal italic">(edited)</span>
                                          )}
                                        </p>

                                        {/* Link Previews */}
                                        {(() => {
                                          const urls = message.content.match(URL_REGEX)
                                          return urls?.map((url, i) => (
                                            <LinkPreview key={i} url={url} />
                                          ))
                                        })()}
                                      </div>
                                    )}

                                    {/* Inline Timestamp and status for grouped messages */}
                                    {isLast && (
                                      <div className={`flex items-center gap-1 mt-1 ${isSent ? "justify-end" : "justify-start"} h-3`}>
                                        <span className={`text-[9px] font-bold tracking-tight uppercase ${isSent ? "text-white/60" : "text-[var(--color-muted-foreground)]"}`}>
                                          {formatTime(message.timestamp)}
                                        </span>
                                        {isSent && getStatusIcon(message.status)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Reactions below bubble */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className={`flex mt-1 ${isSent ? "justify-end" : "justify-start"}`}>
                                  <MessageReactions messageId={message.id} reactions={message.reactions} />
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}

        {/* Pinned Messages Banner */}
        <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-4">
          <PinnedMessages chatId={selectedChat.id} />
        </div>

        {/* Context Menu */}
        {contextMenu.show && (
          <MessageContextMenu
            messageId={contextMenu.messageId}
            isOwnMessage={contextMenu.isOwn}
            isPinned={contextMenu.isPinned}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            onClose={() => setContextMenu({ ...contextMenu, show: false })}
            onEdit={() => {
              const msg = messages.find(m => m.id === contextMenu.messageId)
              if (msg) {
                setEditingMessageId(msg.id)
                setEditContent(msg.content)
              }
            }}
            onForward={() => {
              alert("Forwarding logic would open a chat selector here")
            }}
            onReply={() => {
              const msg = messages.find(m => m.id === contextMenu.messageId)
              if (msg) {
                setReplyingTo(msg)
              }
            }}
          />
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 w-11 h-11 bg-white dark:bg-white/15 rounded-full flex items-center justify-center shadow-2xl glass-effect text-[var(--color-primary)] border-white/50 border z-30 transition-shadow hover:shadow-[var(--color-primary)]/20"
          >
            <ArrowDown className="w-5 h-5" />
            {selectedChat.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--color-card)] animate-bounce">
                {selectedChat.unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
