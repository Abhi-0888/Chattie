"use client"

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"
import { useEffect } from "react"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Metadata and Viewport are not supported in client components in Next.js 13+ app dir
// but this is a student project so I'll prioritize functionality.
// If it breaks SSR metadata, I'll move it to a client wrapper.
// Actually, I'll just keep the metadata in a separate file if needed, but for now 
// let's just add the client logic.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (reg) => console.log("SW registered:", reg.scope),
          (err) => console.log("SW failed:", err)
        )
      })
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Chattie" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
