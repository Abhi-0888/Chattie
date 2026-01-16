"use client"

import { Pin, X, ChevronRight, ChevronLeft } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useState } from "react"
import type { Message } from "@/utils/dummy-chats"

interface PinnedMessagesProps {
    chatId: string
}

export function PinnedMessages({ chatId }: PinnedMessagesProps) {
    const { getPinnedMessages, togglePin } = useChat()
    const pinnedMessages = getPinnedMessages(chatId)
    const [currentIndex, setCurrentIndex] = useState(0)

    if (pinnedMessages.length === 0) return null

    const currentMsg = pinnedMessages[currentIndex]

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length)
    }

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length)
    }

    return (
        <div className="bg-[var(--color-card)]/80 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-2 flex items-center gap-3 animate-in slide-in-from-top duration-300 z-30 sticky top-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Pin className="w-4 h-4 text-[var(--color-primary)]" />
            </div>

            <div className="flex-1 min-w-0 pr-2 border-l-2 border-[var(--color-primary)] pl-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
                        Pinned Message {pinnedMessages.length > 1 && `(${currentIndex + 1}/${pinnedMessages.length})`}
                    </p>
                </div>
                <p className="text-sm text-[var(--color-foreground)] truncate">
                    {currentMsg.isVoiceMessage ? "Voice Message" : currentMsg.content}
                </p>
            </div>

            <div className="flex items-center gap-1">
                {pinnedMessages.length > 1 && (
                    <>
                        <button onClick={handlePrev} className="p-1 hover:bg-[var(--color-secondary)] rounded-md transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={handleNext} className="p-1 hover:bg-[var(--color-secondary)] rounded-md transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}
                <button
                    onClick={() => togglePin(currentMsg.id)}
                    className="p-1 hover:bg-[var(--color-secondary)] rounded-md transition-colors ml-1 text-[var(--color-muted-foreground)]"
                    title="Unpin"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
