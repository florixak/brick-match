"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AsyncQueryState } from "@/components/query/async-query-state"
import { authPaths } from "@/lib/config"
import { useCurrentUser } from "@/lib/queries"
import { cn } from "@/lib/utils"

const GuestShell = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
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
    if (!isPending && !isError && user != null) {
      router.replace(authPaths.defaultAuthenticated)
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
    >
      {(user) => {
        if (user != null) return null

        return <div className={cn(className)}>{children}</div>
      }}
    </AsyncQueryState>
  )
}

export default GuestShell
