"use client"

/**
 * QuickChat - Group Creation Modal
 *
 * Modal dialog for creating new group chats with selected participants.
 * Only shows friends (users who have accepted friend requests).
 */

import { useState } from "react"
import { X, Check, Users, UserPlus } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useFriend } from "@/context/friend-context"

interface GroupCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GroupCreationModal({ isOpen, onClose }: GroupCreationModalProps) {
  const { availableUsers, createGroupChat } = useChat()
  const { isFriend } = useFriend()

  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const friendUsers = availableUsers.filter((user) => isFriend(user.id))

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreate = () => {
    if (groupName.trim() && selectedUsers.length >= 1) {
      createGroupChat(groupName.trim(), selectedUsers)
      handleClose()
    }
  }

  const handleClose = () => {
    setGroupName("")
    setSelectedUsers([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-card)] rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">New Group</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[var(--color-secondary)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Group Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 bg-[var(--color-input)] rounded-lg text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* User Selection - Only Friends */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
              Add Friends ({selectedUsers.length} selected)
            </label>
            <div className="max-h-60 overflow-y-auto custom-scrollbar border border-[var(--color-border)] rounded-lg">
              {friendUsers.length === 0 ? (
                <div className="p-6 text-center text-[var(--color-muted)]">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No friends yet</p>
                  <p className="text-sm mt-1">Add friends from the Users tab first</p>
                </div>
              ) : (
                friendUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user.id)

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleToggleUser(user.id)}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-[var(--color-secondary)] transition-colors ${
                        isSelected ? "bg-[var(--color-accent)]" : ""
                      }`}
                    >
                        <img
                          src={user.avatar || "/default-avatar.png"}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      <span className="flex-1 text-left font-medium text-[var(--color-foreground)]">{user.name}</span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-lg border border-[var(--color-border)] font-medium text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedUsers.length < 1 || friendUsers.length === 0}
            className="flex-1 py-3 px-4 rounded-lg bg-[var(--color-primary)] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  )
}
