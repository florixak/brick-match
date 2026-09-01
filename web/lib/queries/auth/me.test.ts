import type { AuthUser } from "@lego-matcher/shared-types"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiRequestError, apiFetch } from "@/lib/api/client"
import { fetchCurrentUser } from "./me"

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>()
  return {
    ...actual,
    apiFetch: vi.fn(),
  }
})

const mockedFetch = vi.mocked(apiFetch)

const user: AuthUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "a@b.com",
}

describe("queries/auth/me", () => {
  afterEach(() => {
    mockedFetch.mockReset()
  })

  it("should return the user from a successful me response", async () => {
    mockedFetch.mockResolvedValue({
      data: { user },
      meta: {},
    })

    await expect(fetchCurrentUser()).resolves.toEqual(user)
  })

  it("should return null on 401", async () => {
    mockedFetch.mockRejectedValue(
      new ApiRequestError({
        statusCode: 401,
        message: "Unauthorized",
        path: "/api/v1/auth/me",
        timestamp: "2026-01-01T00:00:00.000Z",
      }),
    )

    await expect(fetchCurrentUser()).resolves.toBeNull()
  })

  it("should rethrow non-401 API errors", async () => {
    const error = new ApiRequestError({
      statusCode: 500,
      message: "Internal Server Error",
      path: "/api/v1/auth/me",
      timestamp: "2026-01-01T00:00:00.000Z",
    })
    mockedFetch.mockRejectedValue(error)

    await expect(fetchCurrentUser()).rejects.toBe(error)
  })
})
