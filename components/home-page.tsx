"use client"

/**
 * QuickChat - Home Page Component
 *
 * Main application layout with responsive sidebar and chat window.
 */

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { ChatWindow } from "./chat-window"
import { useChat } from "@/context/chat-context"
import { SearchBar } from "./search-bar"

export function HomePage() {
  const { selectedChat } = useChat()
  const [showSidebar, setShowSidebar] = useState(true)
  const [showSearch, setShowSearch] = useState(false)

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
      if (e.key === "Escape") {
        setShowSearch(false)
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
    </div>
  )
}
