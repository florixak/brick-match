"use client"

import { RegisterRequestSchema } from "@lego-matcher/shared-types"
import { Check, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { parseApiError } from "@/lib/api/client"
import { useRegisterMutation } from "@/lib/queries"
import PasswordField from "./password-field"

const RegisterForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const { mutate: register, isPending } = useRegisterMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: {
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match"
    }

    const parsed = RegisterRequestSchema.safeParse({ email, password })

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as "email" | "password"
        errors[field] = issue.message
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    register(parsed.data!, {
      onError: (error) => {
        const apiError = parseApiError(error)
        toast.error(
          apiError?.body.message ?? "Registration failed. Please try again.",
        )
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-black block mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email)
              setFieldErrors((prev) => ({ ...prev, email: undefined }))
          }}
          placeholder="you@example.com"
          disabled={isPending}
          className="w-full border-2 border-border rounded-xl px-4 py-3 bg-card focus:outline-none focus:border-primary text-sm font-semibold disabled:opacity-50"
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p className="text-destructive text-xs font-semibold mt-1">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-black block mb-1.5">
          Password
        </label>
        <PasswordField
          id="password"
          value={password}
          onChange={(val) => {
            setPassword(val)
            if (fieldErrors.password)
              setFieldErrors((prev) => ({ ...prev, password: undefined }))
          }}
          disabled={isPending}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        {fieldErrors.password && (
          <p className="text-destructive text-xs font-semibold mt-1">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-sm font-black block mb-1.5"
        >
          Confirm Password
        </label>
        <PasswordField
          id="confirmPassword"
          value={confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val)
            if (fieldErrors.confirmPassword)
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: undefined,
              }))
          }}
          disabled={isPending}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
        {fieldErrors.confirmPassword && (
          <p className="text-destructive text-xs font-semibold mt-1">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <button
          type="button"
          onClick={() => setAgreed((a) => !a)}
          disabled={isPending}
          className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
            agreed
              ? "bg-primary border-primary"
              : "border-border hover:border-primary/50"
          } disabled:opacity-50`}
          aria-pressed={agreed}
          aria-label="I agree to the Privacy Policy and Terms of Service"
        >
          {agreed && <Check className="w-3 h-3 text-white" />}
        </button>
        <span className="text-sm text-muted-foreground font-semibold leading-snug">
          I agree to the{" "}
          <span className="text-primary font-black cursor-pointer hover:underline">
            Privacy Policy
          </span>{" "}
          and{" "}
          <span className="text-primary font-black cursor-pointer hover:underline">
            Terms of Service
          </span>
        </span>
      </label>

      <Button
        type="submit"
        disabled={
          !email || !password || !confirmPassword || !agreed || isPending
        }
        className="w-full"
      >
        <UserPlus className="w-4 h-4" />
        {isPending ? "Creating account…" : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground font-semibold">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-black hover:underline">
          Log in here
        </Link>
      </p>
    </form>
  )
}

export default RegisterForm
