"use client"

/**
 * QuickChat - Register Page Component
 *
 * Registration page for new users.
 */

import type React from "react"
import { useState } from "react"
import { MessageSquare, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface RegisterPageProps {
  onSwitchToLogin: () => void
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register, error, isLoading } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return
    }

    await register(name, email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Create an account</h1>
          <p className="text-[var(--color-muted)] mt-1">Join QuickChat and start messaging</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--color-card)] rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--color-input)] rounded-lg text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--color-input)] rounded-lg text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>
            </div>

            {/* Error message */}
            {(error || validationError) && (
              <div className="p-3 rounded-lg bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] text-sm">
                {error || validationError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Switch to login */}
          <div className="mt-6 text-center">
            <p className="text-[var(--color-muted)]">
              Already have an account?{" "}
              <button onClick={onSwitchToLogin} className="text-[var(--color-primary)] font-medium hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
