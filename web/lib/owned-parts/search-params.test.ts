import { describe, expect, it } from "vitest"
import { ownedPartsSearchParams, toOwnedPartsQuery } from "./search-params"

const base = {
  search: "",
  page: 1,
  pageSize: 50,
  colorId: null,
  partCategoryId: null,
}

describe("owned-parts/search-params", () => {
  describe("toOwnedPartsQuery", () => {
    it("should always include page and pageSize", () => {
      expect(toOwnedPartsQuery(base)).toEqual({
        page: 1,
        pageSize: 50,
      })
    })

    it("should omit search if it is empty or whitespace", () => {
      expect(
        toOwnedPartsQuery({ ...base, search: "   " }).search,
      ).toBeUndefined()
    })

    it("should include trimmed search if it is non-empty", () => {
      expect(toOwnedPartsQuery({ ...base, search: "  3001  " }).search).toBe(
        "3001",
      )
    })

    it("should omit colorId if it is null", () => {
      expect(toOwnedPartsQuery(base).colorId).toBeUndefined()
    })

    it("should include colorId 0", () => {
      expect(toOwnedPartsQuery({ ...base, colorId: 0 }).colorId).toBe(0)
    })

    it("should omit partCategoryId if it is null", () => {
      expect(toOwnedPartsQuery(base).partCategoryId).toBeUndefined()
    })

    it("should include partCategoryId if it is not null", () => {
      expect(
        toOwnedPartsQuery({ ...base, partCategoryId: 4 }).partCategoryId,
      ).toBe(4)
    })
  })

  describe("ownedPartsSearchParams.pageSize", () => {
    it("should accept allowed page sizes", () => {
      expect(ownedPartsSearchParams.pageSize.parse("25")).toBe(25)
      expect(ownedPartsSearchParams.pageSize.parse("50")).toBe(50)
      expect(ownedPartsSearchParams.pageSize.parse("100")).toBe(100)
      expect(ownedPartsSearchParams.pageSize.parse("200")).toBe(200)
    })

    it("should reject values outside PAGE_SIZE_OPTIONS", () => {
      expect(ownedPartsSearchParams.pageSize.parse("13")).toBeNull()
      expect(ownedPartsSearchParams.pageSize.parse("abc")).toBeNull()
    })
  })
})
