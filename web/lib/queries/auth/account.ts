import {
  type ChangePasswordRequest,
  ChangePasswordRequestSchema,
  type DeleteAccountRequest,
  DeleteAccountRequestSchema,
  UpdateEmailApiResponseSchema,
  type UpdateEmailRequest,
  UpdateEmailRequestSchema,
} from "@lego-matcher/shared-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { apiFetch } from "@/lib/api/client"
import { authPaths } from "@/lib/config"
import { queryKeys } from "@/lib/queries/keys"

export function useUpdateEmailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEmailRequest) =>
      apiFetch("/api/v1/auth/update-email", {
        method: "PATCH",
        body: UpdateEmailRequestSchema.parse(input),
        schema: UpdateEmailApiResponseSchema,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.user(), response.data.user)
      toast.success("Email updated successfully")
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (input: ChangePasswordRequest) =>
      apiFetch("/api/v1/auth/change-password", {
        method: "PATCH",
        body: ChangePasswordRequestSchema.parse(input),
      }),
    onSuccess: () => {
      toast.success("Password changed successfully")
    },
  })
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: DeleteAccountRequest) =>
      apiFetch("/api/v1/auth/account", {
        method: "DELETE",
        body: DeleteAccountRequestSchema.parse(input),
      }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
      queryClient.removeQueries({ queryKey: queryKeys.ownedParts.all })
      queryClient.removeQueries({ queryKey: queryKeys.matches.all })
      router.push(authPaths.login)
    },
  })
}
