"use client"

/**
 * QuickChat - Authentication Context
 *
 * Manages user authentication state throughout the application.
 * Uses dummy authentication for development - easily replaceable with real auth.
 */

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { getAllUsers, saveRegisteredUser, type User, DEFAULT_AVATAR } from "@/utils/dummy-users"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try to restore user session from localStorage on mount
  useEffect(() => {
    setIsLoading(true)
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("quickchat_user") : null
      if (stored) {
        const parsed = JSON.parse(stored) as User
        // Ensure avatar uses default if missing
        const restored: User = { ...parsed, avatar: parsed.avatar || DEFAULT_AVATAR, status: "online" }
        setUser(restored)
      }
    } catch (e) {
      console.error("[Auth] Failed to restore user from localStorage:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Login function - authenticates user with email/password
   * In production, this would call a real authentication API
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const allUsers = getAllUsers()
    const foundUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (foundUser && password.length >= 6) {
      const loggedInUser = { ...foundUser, status: "online" as const }
      setUser(loggedInUser)
      localStorage.setItem("quickchat_user", JSON.stringify(loggedInUser))
      setIsLoading(false)
      return true
    }

    setError("Invalid email or password")
    setIsLoading(false)
    return false
  }, [])

  /**
   * Register function - creates new user account
   * In production, this would call a real registration API
   */
  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const allUsers = getAllUsers()
    const existingUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      setError("Email already registered")
      setIsLoading(false)
      return false
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return false
    }

    // Create new user (use default avatar)
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: DEFAULT_AVATAR,
      status: "online",
    }

    saveRegisteredUser(newUser)

    setUser(newUser)
    localStorage.setItem("quickchat_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }, [])

  /**
   * Logout function - clears user session
   */
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("quickchat_user")
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
