import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QuickChat - Student-Built Messaging App",
  description: "A lightweight real-time messaging application built by students for fast and simple conversations",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#25D366",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
