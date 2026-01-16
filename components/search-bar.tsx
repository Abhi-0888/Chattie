"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, MessageSquare, Clock, ArrowRight } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { format } from "date-fns"

interface SearchBarProps {
    onClose: () => void
}

export function SearchBar({ onClose }: SearchBarProps) {
    const { searchMessages, selectChat } = useChat()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                const found = searchMessages(query)
                setResults(found)
            } else {
                setResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, searchMessages])

    const handleResultClick = (chatId: string) => {
        selectChat(chatId)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex justify-center pt-20 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-xl mx-4 bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 slide-in-from-top-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
                    <Search className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search messages..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] text-lg"
                    />
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[var(--color-secondary)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {query && results.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="w-16 h-16 bg-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-[var(--color-muted-foreground)]" />
                            </div>
                            <p className="text-[var(--color-muted-foreground)]">No messages found for &quot;{query}&quot;</p>
                        </div>
                    ) : query ? (
                        <div className="py-2">
                            <p className="px-4 py-2 text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Search Results ({results.length})</p>
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result.chatId)}
                                    className="w-full px-4 py-3 hover:bg-[var(--color-secondary)] transition-colors flex flex-col gap-1 items-start text-left border-b border-[var(--color-border)] last:border-none"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            In Conversation
                                        </span>
                                        <span className="text-[10px] text-[var(--color-muted-foreground)] flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(result.timestamp), "MMM d, HH:mm")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-foreground)] line-clamp-2">
                                        {result.content}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-[var(--color-muted-foreground)] flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                Type to search across all your conversations
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-[var(--color-secondary)] border-t border-[var(--color-border)] flex items-center justify-between text-[10px] font-medium text-[var(--color-muted-foreground)]">
                    <div className="flex items-center gap-3">
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm">CTRL</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm">K</kbd> to search</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm">↑↓</kbd> to navigate</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm">ESC</kbd> to close</span>
                    </div>
                    <ArrowRight className="w-3 h-3" />
                </div>
            </div>
        </div>
    )
}
