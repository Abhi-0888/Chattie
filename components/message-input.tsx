"use client"

/**
 * QuickChat - Message Input Component
 *
 * Input field for composing and sending messages.
 * Features typing indicator integration and emoji support placeholder.
 */

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Smile, Paperclip, Mic } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useSocket } from "@/context/socket-context"
import { EmojiPicker } from "./emoji-picker"
import { VoiceRecorder } from "./voice-recorder"

export function MessageInput() {
  const { selectedChat, sendMessage, setTyping } = useChat()
  const { emit } = useSocket()

  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input when chat changes or when closing emoji picker/voice recorder
  useEffect(() => {
    if (!showEmojiPicker && !showVoiceRecorder) {
      inputRef.current?.focus()
    }
  }, [selectedChat?.id, showEmojiPicker, showVoiceRecorder])

  // Handle typing indicator
  useEffect(() => {
    if (!selectedChat) return

    if (message && !isTyping) {
      setIsTyping(true)
      setTyping(selectedChat.id, true)
      emit("typing:start", { chatId: selectedChat.id })
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        setTyping(selectedChat.id, false)
        emit("typing:stop", { chatId: selectedChat.id })
      }
    }, 2000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, selectedChat, isTyping, setTyping, emit])

  const handleSend = () => {
    if (!message.trim() || !selectedChat) return

    sendMessage(message)
    setMessage("")
    setIsTyping(false)
    setTyping(selectedChat.id, false)
    emit("typing:stop", { chatId: selectedChat.id })

    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!selectedChat) return null

  return (
    <div className="p-4 bg-[var(--color-card)] border-t border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-lg hover:bg-[var(--color-secondary)] transition-all duration-200 active:scale-95 ${showEmojiPicker ? "bg-[var(--color-secondary)]" : ""}`}
            title="Emoji"
          >
            <Smile className="w-5 h-5 text-[var(--color-primary)]" />
          </button>

          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                setMessage(prev => prev + emoji)
                setShowEmojiPicker(false)
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Attachment button */}
        <button className="p-2.5 rounded-lg hover:bg-[var(--color-secondary)] transition-all duration-200 active:scale-95" title="Attach file">
          <Paperclip className="w-5 h-5 text-[var(--color-primary)]" />
        </button>

        {/* Input field */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="modern-input w-full px-4 py-3 bg-[var(--color-input)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-opacity-20"
          />
        </div>

        {/* Send/Voice button */}
        {message.trim() ? (
          <button
            onClick={handleSend}
            className="p-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#ec4899] hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="p-3 rounded-lg hover:bg-[var(--color-secondary)] transition-all duration-200 active:scale-95"
            title="Voice message"
          >
            <Mic className="w-5 h-5 text-[var(--color-primary)]" />
          </button>
        )}
      </div>

      {showVoiceRecorder && (
        <VoiceRecorder
          onSend={(duration) => {
            sendMessage("", { isVoiceMessage: true, voiceDuration: duration })
            setShowVoiceRecorder(false)
          }}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}
    </div>
  )
}
