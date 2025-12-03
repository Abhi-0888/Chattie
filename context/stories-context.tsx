"use client"

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import { useAuth } from "./auth-context"

export interface Story {
  id: string
  userId: string
  content: string // could be text or image URL
  createdAt: string // ISO
  expiresAt: string // ISO
  viewers?: string[]
}

const STORAGE_KEY = "quickchat_stories"

function readStoriesFromStorage(): Story[] {
  if (typeof window === "undefined") return []
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : []
  } catch {
    return []
  }
}

function saveStoriesToStorage(stories: Story[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories))
  } catch (e) {
    console.error("[Stories] Error saving to storage", e)
  }
}

export interface StoriesContextType {
  stories: Story[]
  getStoriesForUser: (userId: string) => Story[]
  createStory: (userId: string, content: string, hours?: number) => Story
  removeStory: (storyId: string) => void
  markViewed: (storyId: string, viewerId: string) => void
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined)

export function StoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>(() => readStoriesFromStorage())

  // Cleanup expired stories on interval
  useEffect(() => {
    const cleanup = () => {
      const now = new Date().toISOString()
      setStories((prev) => {
        const filtered = prev.filter((s) => s.expiresAt > now)
        if (filtered.length !== prev.length) saveStoriesToStorage(filtered)
        return filtered
      })
    }

    const iv = setInterval(cleanup, 60 * 1000) // every minute
    cleanup()
    return () => clearInterval(iv)
  }, [])

  // Watch storage events to sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setStories(readStoriesFromStorage())
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const getStoriesForUser = useCallback((userId: string) => {
    const now = new Date().toISOString()
    return stories.filter((s) => s.userId === userId && s.expiresAt > now)
  }, [stories])

  const createStory = useCallback((userId: string, content: string, hours = 24) => {
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + hours * 3600 * 1000)
    const story: Story = {
      id: `story-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      content,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      viewers: [],
    }
    setStories((prev) => {
      const next = [story, ...prev]
      saveStoriesToStorage(next)
      return next
    })
    return story
  }, [])

  const removeStory = useCallback((storyId: string) => {
    setStories((prev) => {
      const updated = prev.filter((s) => s.id !== storyId)
      saveStoriesToStorage(updated)
      return updated
    })
  }, [])

  const markViewed = useCallback((storyId: string, viewerId: string) => {
    setStories((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== storyId) return s
        if (!s.viewers) s.viewers = []
        if (!s.viewers.includes(viewerId)) s.viewers = [...s.viewers, viewerId]
        return s
      })
      saveStoriesToStorage(updated)
      return updated
    })
  }, [])

  const value = useMemo(
    () => ({ stories, getStoriesForUser, createStory, removeStory, markViewed }),
    [stories, getStoriesForUser, createStory, removeStory, markViewed],
  )

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>
}

export function useStories() {
  const ctx = useContext(StoriesContext)
  if (!ctx) throw new Error("useStories must be used within StoriesProvider")
  return ctx
}

export default StoriesProvider
