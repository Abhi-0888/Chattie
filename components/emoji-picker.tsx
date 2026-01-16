"use client"

import { useState, useEffect } from "react"
import { Search, Smile, Heart, ThumbsUp, Laugh, Frown, MessageCircle } from "lucide-react"

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void
    onClose: () => void
}

const POPULAR_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "💯", "✅", "❌"]

const EMOJI_CATEGORIES = [
    {
        name: "Smileys & Emotion",
        emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠"]
    },
    {
        name: "Hands & People",
        emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄"]
    },
    {
        name: "Animals & Nature",
        emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🪰", "🪲", "🪳", "🦂", "🕸️", "🕷️", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾", "🐉", "🐲", "🌵", "🎄", "🌲", "🌳", "🌴", "🪵", "🌱", "🌿", "☘️", "🍀", "🎍", "🪴", "🎋", "🍃", "🍂", "🍁", "🍄", "🐚", "🪨", "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌎", "🌍", "🌏", "🪐", "💫", "⭐️", "🌟", "✨", "⚡️", "☄️", "💥", "🔥", "🌪️", "🌈", "☀️", "🌤️", "⛅️", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄️", "🌬️", "💨", "💧", "💦", "☔️", "☂️", "🌊", "🌫️"]
    }
]

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
    const [search, setSearch] = useState("")
    const [filteredEmojis, setFilteredEmojis] = useState<string[]>([])

    useEffect(() => {
        if (search.trim()) {
            const allEmojis = EMOJI_CATEGORIES.flatMap(cat => cat.emojis)
            // This is a naive search, ideally we'd have labels for each emoji
            // For now, it just shows all if there's any search text
            setFilteredEmojis(allEmojis.slice(0, 50))
        } else {
            setFilteredEmojis([])
        }
    }, [search])

    return (
        <div className="absolute bottom-full mb-2 right-0 w-72 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-3 border-b border-[var(--color-border)]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search emojis..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-secondary)] border-none rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-primary)]"
                        autoFocus
                    />
                </div>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                {search ? (
                    <div className="grid grid-cols-8 gap-1">
                        {filteredEmojis.map((emoji, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    onEmojiSelect(emoji)
                                    onClose()
                                }}
                                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-[var(--color-secondary)] rounded-md transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2 px-1">Popular</p>
                            <div className="grid grid-cols-8 gap-1">
                                {POPULAR_EMOJIS.map((emoji, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            onEmojiSelect(emoji)
                                            onClose()
                                        }}
                                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-[var(--color-secondary)] rounded-md transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {EMOJI_CATEGORIES.map((cat, i) => (
                            <div key={i} className="mb-4">
                                <p className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2 px-1">{cat.name}</p>
                                <div className="grid grid-cols-8 gap-1">
                                    {cat.emojis.map((emoji, j) => (
                                        <button
                                            key={j}
                                            onClick={() => {
                                                onEmojiSelect(emoji)
                                                onClose()
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-[var(--color-secondary)] rounded-md transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
