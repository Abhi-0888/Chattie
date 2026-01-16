"use client"
import { ArrowLeft, Phone, Video, MoreVertical, Users, Trash2 } from "lucide-react"
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

    return `${typingNames} is typing...`
  }

  return (
    <div className="header-gradient flex items-center justify-between px-4 py-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        {/* Back button for mobile */}
        <button
          onClick={onBackClick}
          className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 md:hidden active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative">
          <img
            src={getChatAvatar(selectedChat) || "/default-avatar.png"}
            alt={getChatName(selectedChat)}
            className="w-12 h-12 rounded-lg object-cover border-2 border-white/30 shadow-md"
          />
          {selectedChat.type === "direct" && otherUser && (
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${otherUser.status === "online" ? "bg-[var(--color-online)]" : "bg-[var(--color-offline)]"
                } shadow-md`}
            />
          )}
          {selectedChat.type === "group" && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center backdrop-blur">
              <Users className="w-3 h-3 text-white" />
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="font-bold text-white">{getChatName(selectedChat)}</h2>
          <p className="text-sm text-white/80 flex items-center gap-1">
            {isTyping ? (
              <span className="flex items-center gap-1">
                {getTypingText()}
                <span className="flex gap-0.5 ml-1">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </span>
            ) : selectedChat.type === "direct" ? (
              otherUser?.status === "online" ? (
                "Online"
              ) : (
                `Last seen ${otherUser?.lastSeen || "recently"}`
              )
            ) : (
              <span className="truncate max-w-[200px]">{getParticipantNames()}</span>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-95" title="Video call">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-95" title="Voice call">
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={onInfoClick}
          className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-95"
          title="Chat info"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="p-2 rounded-lg hover:bg-red-500/30 transition-all duration-200 active:scale-95"
          title="Delete chat"
        >
          <Trash2 className="w-5 h-5" />
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
