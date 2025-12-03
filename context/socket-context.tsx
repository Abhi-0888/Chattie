"use client"

/**
 * QuickChat - Socket Context (Mock Implementation)
 *
 * Provides WebSocket-like functionality for real-time features.
 * This is a placeholder implementation that simulates socket behavior.
 *
 * In production, replace with actual Socket.io or WebSocket connection:
 * - import { io } from "socket.io-client";
 * - const socket = io("YOUR_SOCKET_SERVER_URL");
 */

import type React from "react"
import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { useAuth } from "./auth-context"

type SocketEventHandler = (data: unknown) => void

interface SocketContextType {
  isConnected: boolean
  emit: (event: string, data: unknown) => void
  on: (event: string, handler: SocketEventHandler) => void
  off: (event: string, handler: SocketEventHandler) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [eventHandlers, setEventHandlers] = useState<{
    [event: string]: SocketEventHandler[]
  }>({})

  /**
   * Simulate socket connection when user authenticates
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      // Simulate connection delay
      const timer = setTimeout(() => {
        setIsConnected(true)
        console.log("[QuickChat Socket] Connected as:", user.name)

        // Emit connected event
        triggerEvent("user:connected", { userId: user.id })
      }, 500)

      return () => {
        clearTimeout(timer)
        setIsConnected(false)
        console.log("[QuickChat Socket] Disconnected")
      }
    } else {
      setIsConnected(false)
    }
  }, [isAuthenticated, user])

  /**
   * Trigger all handlers for an event
   */
  const triggerEvent = useCallback(
    (event: string, data: unknown) => {
      const handlers = eventHandlers[event] || []
      handlers.forEach((handler) => handler(data))
    },
    [eventHandlers],
  )

  /**
   * Emit an event (simulates sending to server)
   * In production, this would use socket.emit()
   */
  const emit = useCallback(
    (event: string, data: unknown) => {
      if (!isConnected) {
        console.warn("[QuickChat Socket] Not connected, cannot emit:", event)
        return
      }

      console.log("[QuickChat Socket] Emit:", event, data)

      // Simulate server response for certain events
      switch (event) {
        case "message:send":
          // Simulate message delivery confirmation
          setTimeout(() => {
            triggerEvent("message:delivered", data)
          }, 500)
          break

        case "typing:start":
          // Simulate typing indicator broadcast
          setTimeout(() => {
            triggerEvent("user:typing", data)
          }, 100)
          break

        case "typing:stop":
          setTimeout(() => {
            triggerEvent("user:stopped-typing", data)
          }, 100)
          break

        default:
          break
      }
    },
    [isConnected, triggerEvent],
  )

  /**
   * Subscribe to an event
   */
  const on = useCallback((event: string, handler: SocketEventHandler) => {
    setEventHandlers((prev) => ({
      ...prev,
      [event]: [...(prev[event] || []), handler],
    }))
  }, [])

  /**
   * Unsubscribe from an event
   */
  const off = useCallback((event: string, handler: SocketEventHandler) => {
    setEventHandlers((prev) => ({
      ...prev,
      [event]: (prev[event] || []).filter((h) => h !== handler),
    }))
  }, [])

  /**
   * Simulate random typing indicators from other users
   */
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      // Randomly trigger typing indicator (10% chance)
      if (Math.random() < 0.1) {
        triggerEvent("user:typing", {
          userId: "user-2",
          chatId: "chat-1",
        })

        // Stop typing after 2-4 seconds
        setTimeout(
          () => {
            triggerEvent("user:stopped-typing", {
              userId: "user-2",
              chatId: "chat-1",
            })
          },
          2000 + Math.random() * 2000,
        )
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isConnected, triggerEvent])

  const value: SocketContextType = {
    isConnected,
    emit,
    on,
    off,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

/**
 * Custom hook to access socket context
 */
export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
