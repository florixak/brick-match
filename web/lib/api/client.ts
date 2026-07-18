import {
  type ApiErrorResponse,
  ApiErrorResponseSchema,
} from "@lego-matcher/shared-types"
import type { z } from "zod"
import { env } from "@/lib/env"

export class ApiRequestError extends Error {
  readonly statusCode: number
  readonly body: ApiErrorResponse

  constructor(body: ApiErrorResponse) {
    super(body.message)
    this.name = "ApiRequestError"
    this.statusCode = body.statusCode
    this.body = body
  }
}

type ApiFetchOptions<T extends z.ZodType> = {
  method?: "GET" | "POST" | "DELETE"
  body?: unknown
  schema?: T
  auth?: boolean
  searchParams?: Record<string, string | number | boolean | undefined>
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue
    }

    searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

function buildUrl(
  path: string,
  searchParams?: Record<string, string | number | boolean | undefined>,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const query = searchParams ? buildQueryString(searchParams) : ""
  return `${env.NEXT_PUBLIC_API_URL}${normalizedPath}${query}`
}

export async function apiFetch<T extends z.ZodType>(
  path: string,
  options: ApiFetchOptions<T> = {},
): Promise<z.infer<T>> {
  const { method = "GET", body, schema, auth = false, searchParams } = options

  const headers = new Headers({
    Accept: "application/json",
  })

  if (body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(buildUrl(path, searchParams), {
    method,
    headers,
    credentials: auth ? "include" : "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    return undefined as z.infer<T>
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const parsed = ApiErrorResponseSchema.safeParse(payload)
    if (parsed.success) {
      throw new ApiRequestError(parsed.data)
    }

    throw new ApiRequestError({
      statusCode: response.status,
      message: response.statusText || "Request failed",
      path,
      timestamp: new Date().toISOString(),
    })
  }

  if (!schema) {
    return payload as z.infer<T>
  }

  return schema.parse(payload)
}

export function parseApiError(error: unknown): ApiRequestError | null {
  if (error instanceof ApiRequestError) {
    return error
  }

  return null
}
