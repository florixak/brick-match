"use client"

import { LoginRequestSchema } from "@lego-matcher/shared-types"
import { LogInIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseApiError } from "@/lib/api/client"
import { useLoginMutation } from "@/lib/queries"
import PasswordField from "./password-field"
import TermsPolicyAgree from "./terms-policy-agree"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const { mutate: login, isPending } = useLoginMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsed = LoginRequestSchema.safeParse({ email, password })

    if (!parsed.success) {
      const errors: { email?: string; password?: string } = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as "email" | "password"
        errors[field] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    login(parsed.data, {
      onError: (error) => {
        const apiError = parseApiError(error)
        toast.error(apiError?.body.message ?? "Login failed. Please try again.")
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
        />
        {fieldErrors.password && (
          <p className="text-destructive text-xs font-semibold mt-1">
            {fieldErrors.password}
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
        disabled={!email || !password || !agreed || isPending}
        className="w-full"
      >
        <LogInIcon className="w-4 h-4" />
        {isPending ? "Logging in…" : "Log In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground font-semibold">
        No account?{" "}
        <Link
          href="/register"
          className="text-primary font-black hover:underline"
        >
          Register here
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
