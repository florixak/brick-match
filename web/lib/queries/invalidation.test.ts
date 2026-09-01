import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { invalidateCollectionQueries } from "./invalidation"
import { queryKeys } from "./keys"

function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

const ownedPartsKey = queryKeys.ownedParts.list({ page: 1, pageSize: 50 })
const matchesKey = queryKeys.matches.list({ limit: 50 })
const authKey = queryKeys.auth.user()
const catalogKey = queryKeys.catalog.colors()

describe("queries/invalidation", async () => {
  it("should invalidate owned parts and matches, but not auth or catalog", async () => {
    const queryClient = createTestClient()
    queryClient.setQueryData(ownedPartsKey, { items: [] })
    queryClient.setQueryData(matchesKey, { results: [] })
    queryClient.setQueryData(authKey, { id: "user-1" })
    queryClient.setQueryData(catalogKey, [])

    await invalidateCollectionQueries(queryClient)

    expect(queryClient.getQueryState(ownedPartsKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(matchesKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(authKey)?.isInvalidated).toBe(false)
    expect(queryClient.getQueryState(catalogKey)?.isInvalidated).toBe(false)
  })
})
