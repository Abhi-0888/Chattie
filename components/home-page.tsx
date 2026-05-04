"use client"

/**
 * QuickChat - Home Page Component
 *
 * Main application layout with responsive sidebar and chat window.
 */

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "./sidebar"
import { ChatWindow } from "./chat-window"
import { useChat } from "@/context/chat-context"
import { SearchBar } from "./search-bar"
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal"
import { useDocumentTitle } from "@/hooks/use-document-title"

export function HomePage() {
  const { selectedChat, chats } = useChat()
  const [showSidebar, setShowSidebar] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Calculate total unread count for tab title
  const totalUnread = useMemo(() => {
    return chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
  }, [chats])

  // Update document title with unread count
  useDocumentTitle(totalUnread)

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
      // Ctrl+? or Ctrl+Shift+/ for keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === "?" || (e.shiftKey && e.key === "/"))) {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
      }
      if (e.key === "Escape") {
        setShowSearch(false)
        setShowShortcuts(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar - hidden on mobile when chat is selected */}
      <div
        className={`${selectedChat && !showSidebar ? "hidden" : "flex"
          } md:flex w-full md:w-[400px] lg:w-[420px] flex-shrink-0`}
      >
        <div className="w-full h-full">
          <Sidebar onMobileClose={() => setShowSidebar(false)} />
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${!selectedChat || showSidebar ? "hidden" : "flex"} md:flex flex-1 flex-col`}>
        <ChatWindow onBackClick={() => setShowSidebar(true)} />
      </div>

      {/* Global Search Modals */}
      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}
