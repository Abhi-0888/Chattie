"use client"
import { ArrowLeft, Phone, Video, MoreVertical, Users, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@/context/chat-context"
import { dummyUsers } from "@/utils/dummy-users"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface ChatHeaderProps {
  onBackClick?: () => void
  onInfoClick?: () => void
}

export function ChatHeader({ onBackClick, onInfoClick }: ChatHeaderProps) {
  const { selectedChat, getChatName, getChatAvatar, getOtherParticipant, typingUsers, deleteChat } = useChat()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!selectedChat) return null

  const otherUser = getOtherParticipant(selectedChat)
  const chatTypingUsers = typingUsers[selectedChat.id] || []
  const isTyping = chatTypingUsers.length > 0

  // Get participant names for group chats
  const getParticipantNames = () => {
    if (selectedChat.type !== "group") return ""

    return selectedChat.participants.map((id) => dummyUsers.find((u) => u.id === id)?.name || "Unknown").join(", ")
  }

  // Get typing indicator text
  const getTypingText = () => {
    if (!isTyping) return null

    const typingNames = chatTypingUsers.map((id) => dummyUsers.find((u) => u.id === id)?.name || "Someone").join(", ")

    return typingNames.length > 30 ? "Multiple people are typing" : `${typingNames} is typing`
  }

  return (
    <div className="mesh-gradient flex items-center justify-between px-4 py-3 text-white shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      <div className="relative z-10 flex items-center gap-3">
        {/* Back button for mobile */}
        <button
          onClick={onBackClick}
          className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 md:hidden active:scale-95 bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <img
            src={getChatAvatar(selectedChat) || "/default-avatar.png"}
            alt={getChatName(selectedChat)}
            className="w-11 h-11 rounded-xl object-cover border-2 border-white/30 shadow-md"
          />
          {selectedChat.type === "direct" && otherUser && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${otherUser.status === "online" ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
                } shadow-md`}
            />
          )}
          {selectedChat.type === "group" && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center backdrop-blur">
              <Users className="w-3 h-3 text-white" />
            </span>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h2 className="font-bold text-white text-base leading-tight truncate max-w-[150px] sm:max-w-[250px]">
            {getChatName(selectedChat)}
          </h2>
          <div className="text-[11px] text-white/80 flex items-center gap-1.5 h-4">
            <AnimatePresence mode="wait">
              {isTyping ? (
                <motion.span
                  key="typing"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <span className="font-medium">{getTypingText()}</span>
                  <span className="flex gap-0.5">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      className="w-1 h-1 rounded-full bg-white"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-1 h-1 rounded-full bg-white"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-1 h-1 rounded-full bg-white"
                    />
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="status"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                >
                  {selectedChat.type === "direct" ? (
                    otherUser?.status === "online" ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Online
                      </span>
                    ) : (
                      `Last seen ${otherUser?.lastSeen || "recently"}`
                    )
                  ) : (
                    <span className="truncate max-w-[200px] block">{getParticipantNames()}</span>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-1">
        <button className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-95 bg-white/5" title="Video call">
          <Video className="w-4.5 h-4.5" />
        </button>
        <button className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-95 bg-white/5" title="Voice call">
          <Phone className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={onInfoClick}
          className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-95 bg-white/5"
          title="Chat info"
        >
          <MoreVertical className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="p-2 rounded-xl hover:bg-red-500/30 transition-all duration-200 active:scale-95 ml-1 bg-red-500/10"
          title="Delete chat"
        >
          <Trash2 className="w-4.5 h-4.5 text-red-200" />
        </button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat with <strong>{getChatName(selectedChat)}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteChat(selectedChat.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
