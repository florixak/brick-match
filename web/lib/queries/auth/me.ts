import { type AuthUser, MeApiResponseSchema } from "@lego-matcher/shared-types"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiFetch, parseApiError } from "@/lib/api/client"
import { queryKeys } from "@/lib/queries/keys"

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiFetch("/api/v1/auth/me", {
      schema: MeApiResponseSchema,
    })
    return response.data.user
  } catch (error) {
    if (parseApiError(error)?.statusCode === 401) {
      return null
    }
    throw error
  }
}

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.auth.user(),
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: true,
  })
}

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions())
}
