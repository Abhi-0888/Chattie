"use client"

/**
 * QuickChat - Message List Component
 *
 * Displays messages in a chat with proper styling for sent/received messages.
 * Features auto-scroll and message status indicators.
 */

import { useEffect, useRef } from "react"
import { Check, CheckCheck } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useAuth } from "@/context/auth-context"
import { dummyUsers } from "@/utils/dummy-users"
import { format, isToday, isYesterday } from "date-fns"

export function MessageList() {
  const { selectedChat, messages } = useChat()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
                  <div key={message.id} className={`flex mb-2 ${isSent ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`message-bubble ${isSent ? "sent" : "received"} max-w-[70%] px-4 py-2.5 ${
                        isSent ? "rounded-[20px_20px_4px_20px] text-white" : "rounded-[20px_20px_20px_4px]"
                      }`}
                    >
                      {/* Sender name for group chats */}
                      {showSenderName && (
                        <p className="text-xs font-bold text-[#a78bfa] mb-1">
                          {sender?.name || "Unknown"}
                        </p>
                      )}

                      {/* Message content */}
                      <p className={`text-sm leading-relaxed break-words ${isSent ? "text-white" : "text-[var(--color-foreground)]"}`}>
                        {message.content}
                      </p>

                      {/* Timestamp and status */}
                      <div className={`flex items-center gap-1 mt-1.5 ${isSent ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[11px] font-medium ${isSent ? "text-white/70" : "text-[var(--color-muted)]"}`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {isSent && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
