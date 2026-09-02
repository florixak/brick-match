import { afterEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import {
  ApiRequestError,
  apiFetch,
  buildQueryString,
  buildUrl,
  parseApiError,
} from "@/lib/api/client"

const PingSchema = z.object({ ok: z.boolean() })

function stubFetch(
  response: Partial<Response> & { json?: () => Promise<unknown> },
) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => null,
    ...response,
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

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

  it("should serialize 0 and false", () => {
    expect(buildQueryString({ page: 0, include: false })).toBe(
      "?page=0&include=false",
    )
  })

  it("should return an empty string when every value is undefined", () => {
    expect(buildQueryString({ themeId: undefined })).toBe("")
  })
})

describe("buildUrl", () => {
  it("should prefix the API origin and add a leading slash", () => {
    expect(buildUrl("api/v1/owned-parts")).toBe(
      "http://localhost:3001/api/v1/owned-parts",
    )
  })

  it("should append a query string", () => {
    expect(buildUrl("/api/v1/owned-parts", { page: 2 })).toBe(
      "http://localhost:3001/api/v1/owned-parts?page=2",
    )
  })
})

describe("parseApiError", () => {
  it("should return the error when it is an ApiRequestError", () => {
    const error = new ApiRequestError({
      statusCode: 401,
      message: "Unauthorized",
      path: "/api/v1/owned-parts",
      timestamp: "2026-01-01T00:00:00.000Z",
    })
    expect(parseApiError(error)).toBe(error)
  })

  it("should return null for any other value", () => {
    expect(parseApiError(new Error("boom"))).toBeNull()
    expect(parseApiError("nope")).toBeNull()
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

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("should parse a successful JSON body with the given schema", async () => {
    stubFetch({ json: async () => ({ ok: true }) })

    await expect(
      apiFetch("/api/v1/auth/me", { schema: PingSchema }),
    ).resolves.toEqual({ ok: true })
  })

  it("should return the JSON payload when no schema is given", async () => {
    stubFetch({ json: async () => ({ deleted: true }) })

    await expect(apiFetch("/api/v1/owned-parts/all")).resolves.toEqual({
      deleted: true,
    })
  })

  it("should return undefined for 204 without parsing JSON", async () => {
    const json = vi.fn()
    stubFetch({ ok: true, status: 204, json })

    await expect(apiFetch("/api/v1/auth/logout")).resolves.toBeUndefined()
    expect(json).not.toHaveBeenCalled()
  })

  it("should send credentials on every request", async () => {
    const fetchMock = stubFetch({ json: async () => ({ ok: true }) })

    await apiFetch("/api/v1/auth/me", { schema: PingSchema })

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/auth/me",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    )
  })

  it("should not set Content-Type on GET requests", async () => {
    const fetchMock = stubFetch({ json: async () => ({ ok: true }) })

    await apiFetch("/api/v1/auth/me", { schema: PingSchema })

    const headers = fetchMock.mock.calls[0]?.[1].headers as Headers
    expect(headers.get("Accept")).toBe("application/json")
    expect(headers.get("Content-Type")).toBeNull()
  })

  it("should JSON-stringify the body and set Content-Type on POST", async () => {
    const fetchMock = stubFetch({ json: async () => ({ ok: true }) })

    await apiFetch("/api/v1/auth/login", {
      method: "POST",
      body: { email: "a@b.com" },
      schema: PingSchema,
    })

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    const headers = init.headers as Headers
    expect(init.method).toBe("POST")
    expect(init.body).toBe(JSON.stringify({ email: "a@b.com" }))
    expect(headers.get("Content-Type")).toBe("application/json")
  })

  it("should throw ApiRequestError for a typed non-2xx JSON body", async () => {
    stubFetch({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({
        statusCode: 401,
        message: "Unauthorized",
        path: "/api/v1/owned-parts",
        timestamp: "2026-01-01T00:00:00.000Z",
      }),
    })

    await expect(
      apiFetch("/api/v1/catalog/colors", { schema: PingSchema }),
    ).rejects.toMatchObject({
      name: "ApiRequestError",
      statusCode: 401,
      message: "Unauthorized",
    })
  })

  it("should wrap a non-schema error body in ApiRequestError", async () => {
    stubFetch({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => null,
    })

    await expect(apiFetch("/api/v1/matching")).rejects.toMatchObject({
      name: "ApiRequestError",
      statusCode: 500,
      message: "Internal Server Error",
    })
  })

  it("should use Request failed when the error body is invalid and statusText is empty", async () => {
    stubFetch({
      ok: false,
      status: 502,
      statusText: "",
      json: async () => ({ foo: 1 }),
    })

    await expect(apiFetch("/api/v1/matching")).rejects.toMatchObject({
      name: "ApiRequestError",
      statusCode: 502,
      message: "Request failed",
    })
  })

  it("should throw ZodError when a 200 body does not match the schema", async () => {
    stubFetch({ json: async () => ({ ok: "yes" }) })

    await expect(
      apiFetch("/api/v1/auth/me", { schema: PingSchema }),
    ).rejects.toBeInstanceOf(z.ZodError)
  })
})
