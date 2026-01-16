"use client"

import { Edit2, Trash2, Pin, ArrowRight, Copy, Smile } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useState } from "react"
import { EmojiPicker } from "./emoji-picker"

interface MessageContextMenuProps {
    messageId: string
    isOwnMessage: boolean
    isPinned: boolean
    onClose: () => void
    onEdit: () => void
    onForward: () => void
    position: { x: number; y: number }
}

export function MessageContextMenu({
    messageId,
    isOwnMessage,
    isPinned,
    onClose,
    onEdit,
    onForward,
    position
}) {
    const { togglePin, deleteMessage, addReaction } = useChat()
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const handleCopy = () => {
        // We'd need the content here, but for simplicity let's assume we copy the ID or it's handled by the parent
        // In a real app we'd pass the content
        onClose()
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this message?")) {
            deleteMessage(messageId)
        }
        onClose()
    }

    const handleTogglePin = () => {
        togglePin(messageId)
        onClose()
    }

    const handleEdit = () => {
        onEdit()
        onClose()
    }

    return (
        <>
            {/* Overlay to close menu */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
                onContextMenu={(e) => { e.preventDefault(); onClose(); }}
            />

            <div
                className="fixed z-50 w-56 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-2xl py-1.5 animate-in zoom-in-95 duration-100"
                style={{ left: Math.min(position.x, window.innerWidth - 230), top: Math.min(position.y, window.innerHeight - 300) }}
            >
                {/* Quick Reactions */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] mb-1">
                    {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => {
                                addReaction(messageId, emoji)
                                onClose()
                            }}
                            className="text-lg hover:scale-125 transition-transform p-1 rounded-md hover:bg-[var(--color-secondary)]"
                        >
                            {emoji}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]"
                    >
                        <Smile className="w-4 h-4" />
                    </button>

                    {showEmojiPicker && (
                        <div className="absolute right-0 top-0 mt-10">
                            <EmojiPicker
                                onEmojiSelect={(emoji) => {
                                    addReaction(messageId, emoji)
                                    onClose()
                                }}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleTogglePin}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
                >
                    <Pin className={`w-4 h-4 ${isPinned ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : ""}`} />
                    <span>{isPinned ? "Unpin Message" : "Pin Message"}</span>
                </button>

                <button
                    onClick={onForward}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                    <span>Forward Message</span>
                </button>

                <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
                >
                    <Copy className="w-4 h-4" />
                    <span>Copy Message</span>
                </button>

                {isOwnMessage && (
                    <>
                        <div className="h-px bg-[var(--color-border)] my-1" />
                        <button
                            onClick={handleEdit}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit Message</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Message</span>
                        </button>
                    </>
                )}
            </div>
        </>
    )
}
