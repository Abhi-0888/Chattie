"use client"

/**
 * QuickChat - Message List Component
 *
 * Displays messages in a chat with proper styling for sent/received messages.
 * Features auto-scroll and message status indicators.
 */

import { useEffect, useRef, useState } from "react"
import { Check, CheckCheck, Pin, Share2 } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useAuth } from "@/context/auth-context"
import { dummyUsers } from "@/utils/dummy-users"
import { format, isToday, isYesterday } from "date-fns"
import { MessageReactions } from "./message-reactions"
import { MessageContextMenu } from "./message-context-menu"
import { PinnedMessages } from "./pinned-messages"

export function MessageList() {
  const { selectedChat, messages, editMessage } = useChat()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof chatMessages }[] = []
  let currentDate = ""

  chatMessages.forEach((msg) => {
    const msgDate = formatDateSeparator(msg.timestamp)
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groupedMessages.push({ date: msgDate, messages: [msg] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg)
    }
  })

  // Get message status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-[var(--color-muted)]" />
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-[var(--color-muted)]" />
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  if (!selectedChat) return null

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 chat-background">
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
        <>
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)] bg-[var(--color-card)] rounded-lg shadow-sm">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((message, msgIndex) => {
                const isSent = message.senderId === user?.id
                const sender = dummyUsers.find((u) => u.id === message.senderId)
                const showSenderName =
                  selectedChat.type === "group" &&
                  !isSent &&
                  (msgIndex === 0 || group.messages[msgIndex - 1].senderId !== message.senderId)

                return (
                  <div key={message.id} className={`flex flex-col mb-4 ${isSent ? "items-end" : "items-start"} animate-fade-in-up`}>
                    <div
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
                      className={`message-bubble group relative transition-all duration-200 hover:shadow-md ${isSent ? "sent" : "received"} max-w-[75%] px-4 py-2.5 ${isSent ? "rounded-[20px_20px_4px_20px] text-white" : "rounded-[20px_20px_20px_4px]"
                        } ${message.isPinned ? "border-2 border-[var(--color-primary)]/30 ring-2 ring-[var(--color-primary)]/10" : ""}`}
                    >
                      {/* Pinned Indicator */}
                      {message.isPinned && (
                        <div className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white p-1 rounded-full shadow-sm">
                          <Pin className="w-3 h-3" />
                        </div>
                      )}

                      {/* Forwarded Indicator */}
                      {message.forwarded && (
                        <div className="flex items-center gap-1 mb-1 opacity-70">
                          <Share2 className="w-3 h-3 italic" />
                          <span className="text-[10px] italic">Forwarded</span>
                        </div>
                      )}

                      {/* Sender name for group chats */}
                      {showSenderName && (
                        <p className="text-xs font-bold text-[#a78bfa] mb-1">
                          {sender?.name || "Unknown"}
                        </p>
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
                        <p className={`text-sm leading-relaxed break-words ${isSent ? "text-white" : "text-[var(--color-foreground)]"}`}>
                          {message.content}
                          {message.editedAt && (
                            <span className="ml-1 text-[10px] opacity-50 font-normal">(edited)</span>
                          )}
                        </p>
                      )}

                      {/* Timestamp and status */}
                      <div className={`flex items-center gap-1 mt-1.5 ${isSent ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[11px] font-medium ${isSent ? "text-white/70" : "text-[var(--color-muted)]"}`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {isSent && getStatusIcon(message.status)}
                      </div>
                    </div>

                    {/* Reactions below bubble */}
                    {message.reactions && message.reactions.length > 0 && (
                      <MessageReactions messageId={message.id} reactions={message.reactions} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />

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
                // To be implemented: open a modal to select a chat
                alert("Forwarding logic would open a chat selector here")
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
