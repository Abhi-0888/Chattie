"use client"
import { MessageSquare } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"

interface ChatWindowProps {
  onBackClick?: () => void
}

export function ChatWindow({ onBackClick }: ChatWindowProps) {
  const { selectedChat } = useChat()

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-background)] via-[#f8fafc] to-[var(--color-background)] text-center p-8 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#6366f1]/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-[#ec4899]/20 to-transparent rounded-full blur-3xl animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <MessageSquare className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent mb-3">Welcome to Chattie</h2>
          <p className="text-[var(--color-muted-foreground)] max-w-md text-lg leading-relaxed mb-2">
            Select a conversation or start a new chat to begin. Fast, simple, and secure messaging at your fingertips.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 hover:border-[#10b981]/60 transition-colors duration-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-lg" />
              <span className="font-medium text-[#10b981]">Encrypted</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/30 hover:border-[#6366f1]/60 transition-colors duration-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shadow-lg" />
              <span className="font-medium text-[#6366f1]">Real-time</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader onBackClick={onBackClick} />
      <MessageList />
      <MessageInput />
    </div>
  )
}
