"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { authPaths } from "@/lib/config"
import { useCurrentUser } from "@/lib/queries"

const AuthShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { data: user, isPending, isError } = useCurrentUser()

  useEffect(() => {
    if (!isPending && user === null) {
      router.replace(authPaths.login)
    }
  }, [isPending, user, router])

  if (isPending) return <div>Loading…</div>
  if (isError) return <div>Something went wrong</div>
  if (user === null) return null

  return <>{children}</>
}

export default AuthShell
