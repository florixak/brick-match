import {
  RegisterApiResponseSchema,
  type RegisterRequest,
  RegisterRequestSchema,
} from "@lego-matcher/shared-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { apiFetch } from "@/lib/api/client"
import { authPaths } from "@/lib/config"
import { queryKeys } from "@/lib/queries/keys"

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: RegisterRequest) =>
      apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: RegisterRequestSchema.parse(input),
        schema: RegisterApiResponseSchema,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.user(), response.data.user)
      router.push(authPaths.defaultAuthenticated)
      toast.success("Account created successfully")
    },
  })
}
