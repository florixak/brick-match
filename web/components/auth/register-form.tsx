"use client"

import { RegisterRequestSchema } from "@lego-matcher/shared-types"
import { UserPlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseApiError } from "@/lib/api/client"
import { useRegisterMutation } from "@/lib/queries"
import PasswordField from "./password-field"
import TermsPolicyAgree from "./terms-policy-agree"

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

    const parsed = RegisterRequestSchema.safeParse({ email, password })

    if (!parsed.success) {
      const errors: {
        email?: string
        password?: string
        confirmPassword?: string
      } = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as "email" | "password"
        errors[field] = issue.message
      }
      if (confirmPassword !== password) {
        errors.confirmPassword = "Passwords do not match"
      }
      setFieldErrors(errors)
      return
    }

    if (confirmPassword !== password) {
      setFieldErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    setFieldErrors({})

    register(parsed.data, {
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
        <Input
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
          className="border-border bg-card font-semibold"
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

      <TermsPolicyAgree
        agreed={agreed}
        setAgreed={setAgreed}
        isPending={isPending}
      />

      <Button
        type="submit"
        disabled={
          !email || !password || !confirmPassword || !agreed || isPending
        }
        className="w-full"
      >
        <UserPlusIcon className="w-4 h-4" />
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
