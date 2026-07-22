import { describe, expect, it } from "vitest"
import { getVisiblePageNumbers } from "@/lib/pagination/pagination"

describe("getVisiblePageNumbers", () => {
  it("returns all pages when total is small", () => {
    expect(getVisiblePageNumbers(2, 4)).toEqual([1, 2, 3, 4])
  })

  it("collapses distant pages with ellipsis", () => {
    expect(getVisiblePageNumbers(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ])
  })
})
