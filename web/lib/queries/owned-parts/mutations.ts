import {
  AddOwnedPartApiResponseSchema,
  type AddOwnedPartRequest,
  AddOwnedPartRequestSchema,
  AddSetApiResponseSchema,
  type AddSetRequest,
  AddSetRequestSchema,
  type GetOwnedPartsApiResponse,
  type GetOwnedPartsQuery,
  type RemoveOwnedPartQuery,
} from "@lego-matcher/shared-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { invalidateCollectionQueries } from "@/lib/queries/invalidation"
import { queryKeys } from "@/lib/queries/keys"

type RemoveOwnedPartVariables = RemoveOwnedPartQuery & {
  listQuery: GetOwnedPartsQuery
}

export function useAddOwnedPartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddOwnedPartRequest) =>
      apiFetch("/api/v1/owned-parts", {
        method: "POST",
        body: AddOwnedPartRequestSchema.parse(input),
        schema: AddOwnedPartApiResponseSchema,
      }),
    onSuccess: async () => {
      await invalidateCollectionQueries(queryClient)
    },
  })
}

export function useAddSetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddSetRequest) =>
      apiFetch("/api/v1/owned-parts/sets", {
        method: "POST",
        body: AddSetRequestSchema.parse(input),
        schema: AddSetApiResponseSchema,
      }),
    onSuccess: async () => {
      await invalidateCollectionQueries(queryClient)
    },
  })
}

export function useRemoveOwnedPartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ partNum, colorId }: RemoveOwnedPartVariables) =>
      apiFetch("/api/v1/owned-parts", {
        method: "DELETE",
        searchParams: { partNum, colorId },
      }),
    onMutate: async ({ partNum, colorId, listQuery }) => {
      const queryKey = queryKeys.ownedParts.list(listQuery)
      await queryClient.cancelQueries({ queryKey })

      const previousData =
        queryClient.getQueryData<GetOwnedPartsApiResponse>(queryKey)

      if (previousData) {
        queryClient.setQueryData<GetOwnedPartsApiResponse>(queryKey, {
          ...previousData,
          data: {
            items: previousData.data.items.filter(
              (item) => !(item.partNum === partNum && item.colorId === colorId),
            ),
          },
          meta: {
            ...previousData.meta,
            totalItems: Math.max(0, previousData.meta.totalItems - 1),
          },
        })
      }

      return { previousData, queryKey }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData)
      }
    },
    onSettled: async () => {
      await invalidateCollectionQueries(queryClient)
    },
  })
}
