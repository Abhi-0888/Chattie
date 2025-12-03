"use client"

/**
 * QuickChat - Main Application Entry Point
 *
 * This is the root page component that handles:
 * - Authentication state routing
 * - Context providers setup
 * - Page transitions
 */

import { useState } from "react"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { ChatProvider } from "@/context/chat-context"
import { SocketProvider } from "@/context/socket-context"
import { FriendProvider } from "@/context/friend-context"
import { LoginPage } from "@/components/login-page"
import { RegisterPage } from "@/components/register-page"
import { HomePage } from "@/components/home-page"

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">Loading QuickChat...</p>
        </div>
      </div>
    )
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    return authMode === "login" ? (
      <LoginPage onSwitchToRegister={() => setAuthMode("register")} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthMode("login")} />
    )
  }

  return (
    <SocketProvider>
      <ChatProvider>
        <FriendProvider>
          <HomePage />
        </FriendProvider>
      </ChatProvider>
    </SocketProvider>
  )
}

export default function QuickChatApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
