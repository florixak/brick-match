import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { authPaths } from "@/lib/config"
import { queryKeys } from "@/lib/queries/keys"

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () =>
      apiFetch("/api/v1/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
      queryClient.removeQueries({ queryKey: queryKeys.ownedParts.all })
      queryClient.removeQueries({ queryKey: queryKeys.matches.all })
      router.push(authPaths.login)
    },
  })
}
