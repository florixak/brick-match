import { describe, expect, it, vi } from "vitest"
import { ApiRequestError, buildQueryString } from "@/lib/api/client"

describe("buildQueryString", () => {
  it("serializes defined params and skips undefined values", () => {
    expect(
      buildQueryString({
        page: 1,
        search: "brick",
        themeId: undefined,
      }),
    ).toBe("?page=1&search=brick")
  })
})

describe("ApiRequestError", () => {
  it("preserves API error payload fields", () => {
    const error = new ApiRequestError({
      statusCode: 422,
      message: "Validation failed",
      path: "/api/v1/owned-parts",
      timestamp: "2026-01-01T00:00:00.000Z",
      errors: {
        quantity: ["Must be positive"],
      },
    })

    expect(error.message).toBe("Validation failed")
    expect(error.statusCode).toBe(422)
    expect(error.body.errors?.quantity).toEqual(["Must be positive"])
  })
})

describe("apiFetch error handling", () => {
  it("throws ApiRequestError for non-2xx JSON responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          statusCode: 401,
          message: "Unauthorized",
          path: "/api/v1/owned-parts",
          timestamp: "2026-01-01T00:00:00.000Z",
        }),
      }),
    )

    const { apiFetch } = await import("@/lib/api/client")
    const { ColorsApiResponseSchema } = await import(
      "@lego-matcher/shared-types"
    )

    await expect(
      apiFetch("/api/v1/catalog/colors", {
        schema: ColorsApiResponseSchema,
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Unauthorized",
    })

    vi.unstubAllGlobals()
  })
})
