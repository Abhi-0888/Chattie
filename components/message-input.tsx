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
import { motion, AnimatePresence } from "framer-motion"
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

  const hasContent = message.trim().length > 0

  if (!selectedChat) return null

  return (
    <div className="p-4 bg-[var(--color-background)] border-t border-[var(--color-border)] relative">
      <div className="flex items-end gap-2 sm:gap-3 bg-[var(--color-card)] p-2 rounded-2xl shadow-xl border border-[var(--color-border)] transition-all focus-within:ring-4 focus-within:ring-[var(--color-primary)]/5 glass-effect">
        {/* Emoji button */}
        <div className="relative mb-0.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all duration-200 ${showEmojiPicker ? "bg-[var(--color-primary)]/20 shadow-inner" : ""}`}
            title="Emoji"
          >
            <Smile className="w-5 h-5 text-[var(--color-primary)]" />
          </motion.button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
              >
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    setMessage(prev => prev + emoji)
                    setShowEmojiPicker(false)
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attachment button */}
        <div className="relative mb-0.5">
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && selectedChat) {
                const isImage = file.type.startsWith("image/")
                const fakeUrl = URL.createObjectURL(file)
                sendMessage("", {
                  fileUrl: fakeUrl,
                  fileType: isImage ? "image" : "file",
                  fileName: file.name
                })
              }
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById("file-upload")?.click()}
            className="p-2.5 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all duration-200"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-[var(--color-primary)]" />
          </motion.button>
        </div>

        {/* Input field */}
        <div className="flex-1">
          <textarea
            ref={inputRef as any}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress as any}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-2 py-2.5 bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] border-none focus:ring-0 resize-none min-h-[44px] max-h-[120px] scrollbar-hide text-sm sm:text-base leading-relaxed"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>

        {/* Send/Voice button */}
        <AnimatePresence mode="wait">
          {hasContent ? (
            <motion.button
              key="send"
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
              onClick={handleSend}
              className="mb-0.5 p-3 rounded-xl mesh-gradient text-white shadow-lg hover:shadow-[var(--color-primary)]/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </motion.button>
          ) : (
            <motion.button
              key="mic"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={() => setShowVoiceRecorder(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-0.5 p-3 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all duration-200 group"
              title="Voice message"
            >
              <Mic className="w-5 h-5 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showVoiceRecorder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 bg-[var(--color-background)] z-10"
          >
            <VoiceRecorder
              onSend={(duration) => {
                sendMessage("", { isVoiceMessage: true, voiceDuration: duration })
                setShowVoiceRecorder(false)
              }}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
