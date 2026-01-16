"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"

interface LinkPreviewProps {
    url: string
}

interface Metadata {
    title: string
    description?: string
    image?: string
    siteName?: string
}

export function LinkPreview({ url }: LinkPreviewProps) {
    const [metadata, setMetadata] = useState<Metadata | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate fetching metadata
        const timer = setTimeout(() => {
            let mockMeta: Metadata = {
                title: "Chattie - Modern Messaging",
                description: "Experience the next level of real-time communication.",
                image: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400&q=80",
                siteName: "Chattie"
            }

            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                mockMeta = {
                    title: "YouTube",
                    description: "Watch your favorite videos and creators.",
                    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
                    siteName: "YouTube"
                }
            } else if (url.includes("github.com")) {
                mockMeta = {
                    title: "GitHub: Where the world builds software",
                    description: "GitHub is where over 100 million developers shape the future of software.",
                    image: "https://github.githubassets.com/images/modules/open_graph/github-logo.png",
                    siteName: "GitHub"
                }
            } else if (url.includes("google.com")) {
                mockMeta = {
                    title: "Google",
                    description: "Search the world's information, including webpages, images, videos and more.",
                    image: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
                    siteName: "Google"
                }
            }

            setMetadata(mockMeta)
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [url])

    if (loading) {
        return (
            <div className="mt-2 p-3 bg-black/5 rounded-lg animate-pulse flex flex-col gap-2 border border-white/10">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-24 bg-white/10 rounded w-full" />
            </div>
        )
    }

    if (!metadata) return null

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden border border-white/10 transition-colors group no-underline"
        >
            {metadata.image && (
                <div className="relative h-32 w-full overflow-hidden border-b border-white/10">
                    <img
                        src={metadata.image}
                        alt={metadata.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
            )}
            <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-primary)] font-bold">
                        {metadata.siteName || "Link"}
                    </span>
                    <ExternalLink className="w-3 h-3 text-white/40" />
                </div>
                <h4 className="text-sm font-semibold text-white line-clamp-1 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                    {metadata.title}
                </h4>
                {metadata.description && (
                    <p className="text-[11px] text-white/70 line-clamp-2">
                        {metadata.description}
                    </p>
                )}
            </div>
        </a>
    )
}
