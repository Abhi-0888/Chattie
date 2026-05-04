"use client"

/**
 * QuickChat - useDocumentTitle Hook
 *
 * Manages the document title with unread message count.
 */

import { useEffect, useRef } from "react"

const DEFAULT_TITLE = "Chattie - Quick Chat"

export function useDocumentTitle(unreadCount: number) {
  const originalTitle = useRef(DEFAULT_TITLE)

  useEffect(() => {
    // Store original title on mount
    if (document.title === DEFAULT_TITLE || document.title === originalTitle.current) {
      originalTitle.current = DEFAULT_TITLE
    }

    // Update title based on unread count
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle.current}`
    } else {
      document.title = originalTitle.current
    }

    // Cleanup: restore original title on unmount
    return () => {
      document.title = originalTitle.current
    }
  }, [unreadCount])
}
