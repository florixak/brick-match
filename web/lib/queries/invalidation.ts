import type { QueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"

export async function invalidateCollectionQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.ownedParts.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.matches.all }),
  ])
}
