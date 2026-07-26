import { ApiErrorResponseSchema } from "@lego-matcher/shared-types"
import { useMutation } from "@tanstack/react-query"
import { ApiRequestError, buildUrl } from "@/lib/api/client"

async function fetchMissingPartsCsv(setNum: string): Promise<string> {
  const response = await fetch(
    buildUrl(`/api/v1/matching/${encodeURIComponent(setNum)}/export`),
    {
      method: "GET",
      credentials: "include",
      headers: { Accept: "text/csv" },
    },
  )

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    const parsed = ApiErrorResponseSchema.safeParse(payload)
    if (parsed.success) {
      throw new ApiRequestError(parsed.data)
    }
    throw new ApiRequestError({
      statusCode: response.status,
      message: response.statusText || "Export failed",
      path: `/api/v1/matching/${setNum}/export`,
      timestamp: new Date().toISOString(),
    })
  }

  return response.text()
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function useExportMissingPartsMutation() {
  return useMutation({
    mutationFn: (setNum: string) => fetchMissingPartsCsv(setNum),
    onSuccess: (csv, setNum) => downloadCsv(csv, `${setNum}-missing-parts.csv`),
  })
}
