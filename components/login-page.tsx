"use client"

/**
 * QuickChat - Login Page Component
 *
 * Authentication page for existing users.
 */

import type React from "react"
import { useState } from "react"
import { MessageSquare, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface LoginPageProps {
  onSwitchToRegister: () => void
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login, error, isLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Welcome back</h1>
          <p className="text-[var(--color-muted)] mt-1">Sign in to continue to QuickChat</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--color-card)] rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--color-input)] rounded-lg text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 bg-[var(--color-input)] rounded-lg text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] text-sm">
                {error}
              </div>
            )}

            {/* Demo hint */}
            <div className="p-3 rounded-lg bg-[var(--color-accent)] text-sm text-[var(--color-accent-foreground)]">
              <p className="font-medium">Demo credentials:</p>
              <p>Email: john@example.com | Password: any 6+ chars</p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Switch to register */}
          <div className="mt-6 text-center">
            <p className="text-[var(--color-muted)]">
              Don't have an account?{" "}
              <button onClick={onSwitchToRegister} className="text-[var(--color-primary)] font-medium hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
