"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, X, Send, Play, Pause, Trash2 } from "lucide-react"

interface VoiceRecorderProps {
    onSend: (duration: number) => void
    onCancel: () => void
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(true)
    const [duration, setDuration] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRecording])

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="absolute inset-x-0 bottom-0 bg-[var(--color-card)] border-t border-[var(--color-border)] p-4 flex items-center gap-4 animate-in slide-in-from-bottom duration-300 z-50">
            <button
                onClick={onCancel}
                className="p-2.5 rounded-full hover:bg-red-50 text-red-500 transition-colors"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center gap-4 bg-[var(--color-secondary)] px-4 py-2.5 rounded-full">
                <div className={`w-3 h-3 rounded-full bg-red-500 ${isRecording ? "animate-pulse" : ""}`} />
                <span className="text-sm font-medium tabular-nums">{formatDuration(duration)}</span>

                {/* Mock Waveform */}
                <div className="flex-1 flex items-center gap-[2px] h-6 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-[2px] bg-[var(--color-primary)] rounded-full transition-all duration-200"
                            style={{
                                height: isRecording ? `${Math.random() * 100}%` : '20%',
                                opacity: 0.3 + Math.random() * 0.7
                            }}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={() => onSend(duration)}
                className="p-3 rounded-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
    )
}
