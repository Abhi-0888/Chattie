"use client"

import { X, Users, Image as ImageIcon, Bell, Trash2, Palette, Shield } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { dummyUsers } from "@/utils/dummy-users"
import { useState } from "react"

interface ChatDetailsProps {
    isOpen: boolean
    onClose: () => void
}

export function ChatDetails({ isOpen, onClose }: ChatDetailsProps) {
    const { selectedChat, getChatName, getChatAvatar, messages, updateChat } = useChat()
    const [activeSubTab, setActiveSubTab] = useState<"members" | "media" | "settings">("members")

    if (!selectedChat) return null

    // Get participants
    const participants = selectedChat.participants.map(id =>
        dummyUsers.find(u => u.id === id) || { id, name: "Unknown", avatar: "/default-avatar.png", status: "offline" }
    )

    // Get shared media
    const sharedMedia = messages.filter(m => m.chatId === selectedChat.id && m.fileType === "image")

    // Mock wallpapers
    const wallpapers = [
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80",
        "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80",
        "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80"
    ]

    return (
        <div className={`fixed inset-y-0 right-0 w-80 bg-[var(--color-card)] border-l border-[var(--color-border)] shadow-2xl z-50 transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-foreground)]">Chat Info</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-[var(--color-secondary)] rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="h-full overflow-y-auto custom-scrollbar pb-20">
                {/* Profile Card */}
                <div className="p-6 flex flex-col items-center border-b border-[var(--color-border)] bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent">
                    <div className="relative mb-4">
                        <img
                            src={getChatAvatar(selectedChat)}
                            alt={getChatName(selectedChat)}
                            className="w-24 h-24 rounded-2xl object-cover shadow-lg border-2 border-[var(--color-primary)]/20"
                        />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-foreground)] text-center">{getChatName(selectedChat)}</h2>
                    <p className="text-sm text-[var(--color-muted-foreground)] capitalize">{selectedChat.type} Chat</p>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-1 bg-[var(--color-secondary)]/50 mx-4 mt-6 rounded-xl border border-[var(--color-border)]">
                    <button
                        onClick={() => setActiveSubTab("members")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === "members" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setActiveSubTab("media")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === "media" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`}
                    >
                        Media
                    </button>
                    <button
                        onClick={() => setActiveSubTab("settings")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === "settings" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`}
                    >
                        Settings
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {activeSubTab === "members" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase">
                                    {participants.length} Participants
                                </span>
                            </div>
                            {participants.map((person) => (
                                <div key={person.id} className="flex items-center gap-3 group">
                                    <div className="relative">
                                        <img
                                            src={person.avatar}
                                            alt={person.name}
                                            className="w-10 h-10 rounded-xl object-cover"
                                        />
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-card)] ${person.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate group-hover:text-[var(--color-primary)] transition-colors">
                                            {person.name}
                                        </p>
                                        <p className="text-[10px] text-[var(--color-muted-foreground)]">
                                            {person.id === selectedChat.participants[0] ? "Admin" : "Member"}
                                        </p>
                                    </div>
                                    <Shield className="w-4 h-4 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSubTab === "media" && (
                        <div>
                            {sharedMedia.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--color-muted)]">
                                    <ImageIcon className="w-12 h-12 opacity-20 mb-2" />
                                    <p className="text-sm">No shared media yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {sharedMedia.map((m) => (
                                        <div key={m.id} className="aspect-square relative group overflow-hidden rounded-lg border border-white/10">
                                            <img
                                                src={m.fileUrl}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeSubTab === "settings" && (
                        <div className="space-y-6">
                            {/* Wallpaper Picker */}
                            <div>
                                <h4 className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase mb-3 flex items-center gap-2">
                                    <Palette className="w-4 h-4" /> Wallpaper
                                </h4>
                                <div className="grid grid-cols-5 gap-2">
                                    <button
                                        onClick={() => updateChat(selectedChat.id, { wallpaper: undefined })}
                                        className="aspect-square rounded-md bg-[var(--color-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                                        title="No wallpaper"
                                    />
                                    {wallpapers.map((wp, i) => (
                                        <button
                                            key={i}
                                            onClick={() => updateChat(selectedChat.id, { wallpaper: wp })}
                                            className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedChat.wallpaper === wp ? "border-[var(--color-primary)] scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                                        >
                                            <img src={wp} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notification Settings */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase flex items-center gap-2">
                                    <Bell className="w-4 h-4" /> Notifications
                                </h4>
                                <div className="flex items-center justify-between p-3 bg-[var(--color-secondary)]/50 rounded-xl border border-[var(--color-border)]">
                                    <span className="text-sm">Mute Notifications</span>
                                    <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer">
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform" />
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-4 space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Clear Chat History</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
