"use client"

/**
 * QuickChat - Keyboard Shortcuts Help Modal
 *
 * Displays available keyboard shortcuts for power users.
 */

import { motion, AnimatePresence } from "framer-motion"
import { X, Command } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutGroup {
  title: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Open global search" },
      { keys: ["Esc"], description: "Close search / modals" },
      { keys: ["Arrow Up/Down"], description: "Navigate messages" },
    ],
  },
  {
    title: "Messaging",
    shortcuts: [
      { keys: ["Enter"], description: "Send message" },
      { keys: ["Shift", "Enter"], description: "New line in message" },
      { keys: ["Ctrl", "/"], description: "Focus message input" },
    ],
  },
  {
    title: "Chat Actions",
    shortcuts: [
      { keys: ["Right Click"], description: "Message options (reply, pin, etc.)" },
      { keys: ["Ctrl", "E"], description: "Export current chat" },
      { keys: ["Ctrl", "R"], description: "Mark all as read" },
    ],
  },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-lg max-h-[85vh] overflow-hidden bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-gradient-to-r from-[#6366f1]/10 to-[#ec4899]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center shadow-lg">
                  <Command className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-[var(--color-foreground)]">Keyboard Shortcuts</h2>
                  <p className="text-xs text-[var(--color-muted)]">Power user commands</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--color-secondary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--color-muted)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {shortcutGroups.map((group, groupIndex) => (
                <div key={group.title}>
                  <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[var(--color-secondary)]/30 rounded-xl hover:bg-[var(--color-secondary)]/50 transition-colors"
                      >
                        <span className="text-sm text-[var(--color-foreground)]">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center">
                              <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-sm text-[var(--color-foreground)]">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-[var(--color-muted)]">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-secondary)]/20">
              <p className="text-xs text-center text-[var(--color-muted)]">
                Press <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--color-card)] border border-[var(--color-border)] rounded">Esc</kbd> to close this modal
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
