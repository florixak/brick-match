"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AuthLoadingSkeleton from "@/components/layout/auth-loading-skeleton"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { authPaths } from "@/lib/config"
import { useCurrentUser } from "@/lib/queries"

const AuthShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const {
    data: user,
    isPending,
    isFetching,
    isError,
    isSuccess,
    error,
    refetch,
  } = useCurrentUser()

  useEffect(() => {
    if (!isPending && !isError && user == null) {
      router.replace(authPaths.login)
    }
  }, [isPending, isError, user, router])

  return (
    <AsyncQueryState
      isLoading={isPending}
      isFetching={isFetching}
      isError={isError}
      isSuccess={isSuccess}
      error={error}
      data={user}
      onRetry={() => void refetch()}
      skeleton={<AuthLoadingSkeleton />}
    >
      {(user) => {
        if (user == null) return null

        return <>{children}</>
      }}
    </AsyncQueryState>
  )
}

export default AuthShell
