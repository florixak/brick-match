import { describe, expect, it } from "vitest"
import { matchesQueryEqual, toMatchesQuery } from "./search-params"

describe("matching/search-params", () => {
  describe("toMatchesQuery", () => {
    it("should omit minMatchPercentage if it is 0", () => {
      const params = {
        minMatchPercentage: 0,
        limit: 10,
        themeId: 1,
      }
      const query = toMatchesQuery(params)
      expect(query.minMatchPercentage).toBeUndefined()
    })

    it("should include minMatchPercentage if it is greater than 0", () => {
      const params = {
        minMatchPercentage: 0.5,
        limit: 10,
        themeId: 1,
      }
      const query = toMatchesQuery(params)
      expect(query.minMatchPercentage).toBe(0.5)
    })

    it("should omit themeId if it is null", () => {
      const params = {
        minMatchPercentage: 0.5,
        limit: 10,
        themeId: null,
      }
      const query = toMatchesQuery(params)
      expect(query.themeId).toBeUndefined()
    })

    it("should include themeId if it is not null", () => {
      const params = {
        minMatchPercentage: 0.5,
        limit: 10,
        themeId: 1,
      }
      const query = toMatchesQuery(params)
      expect(query.themeId).toBe(1)
    })
  })

  describe("matchesQueryEqual", () => {
    it("should return true if the queries are equal", () => {
      const query1 = {
        minMatchPercentage: 0.5,
        limit: 10,
        themeId: 1,
      }
      const query2 = {
        minMatchPercentage: 0.5,
        limit: 10,
        themeId: 1,
      }
      expect(matchesQueryEqual(query1, query2)).toBe(true)
    })

    it("should return false if the queries are not equal", () => {
      const query1 = {
        minMatchPercentage: 0.5,
        limit: 10,
        themeId: 1,
      }
      const query2 = {
        minMatchPercentage: 0.6,
        limit: 10,
        themeId: 1,
      }
      expect(matchesQueryEqual(query1, query2)).toBe(false)
    })

    it("should return false if the queries are not equal and one has a minMatchPercentage", () => {
      const query1 = {
        minMatchPercentage: 0.5,
        limit: 10,
        themeId: 1,
      }
      const query2 = {
        limit: 10,
        themeId: 1,
      }
      expect(matchesQueryEqual(query1, query2)).toBe(false)
    })
  })
})
