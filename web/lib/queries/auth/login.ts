import {
  LoginApiResponseSchema,
  type LoginRequest,
  LoginRequestSchema,
} from "@lego-matcher/shared-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { authPaths } from "@/lib/config"
import { queryKeys } from "@/lib/queries/keys"

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: LoginRequest) =>
      apiFetch("/api/v1/auth/login", {
        method: "POST",
        body: LoginRequestSchema.parse(input),
        schema: LoginApiResponseSchema,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.user(), response.data.user)
      router.push(authPaths.defaultAuthenticated)
    },
  })
}
