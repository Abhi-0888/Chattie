"use client"

import { useChat } from "@/context/chat-context"

interface MessageReactionsProps {
    messageId: string
    reactions: { emoji: string; userIds: string[] }[]
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
    const { addReaction, removeReaction } = useChat()
    const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('quickchat_user') || '{}').id : null

    if (!reactions || reactions.length === 0) return null

    return (
        <div className="flex flex-wrap gap-1 mt-1 px-2">
            {reactions.map((reaction, index) => {
                const isSelected = reaction.userIds.includes(currentUserId)
                return (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (isSelected) {
                                removeReaction(messageId, reaction.emoji)
                            } else {
                                addReaction(messageId, reaction.emoji)
                            }
                        }}
                        className={`group relative flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs transition-all duration-200 ${isSelected
                                ? "bg-[var(--color-primary)] text-white shadow-sm scale-105"
                                : "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]"
                            }`}
                    >
                        <span>{reaction.emoji}</span>
                        {reaction.userIds.length > 1 && (
                            <span className="font-medium">{reaction.userIds.length}</span>
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {isSelected ? "You and " : ""}{reaction.userIds.length - (isSelected ? 1 : 0)} others reacted
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
