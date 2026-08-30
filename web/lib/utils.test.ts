import { describe, expect, it } from "vitest"
import {
  formatSetNumber,
  getFirstTwoLetters,
  getPartImageUrlCandidates,
  getSetImageUrl,
  getSetImageUrlCandidates,
  getThemeDotClassName,
  getThemeTextClassName,
} from "./utils"

function colorIdsFromPartUrls(urls: string[]) {
  return urls.map((url) => Number(url.match(/\/ldraw\/(\d+)\//)?.[1]))
}

describe("utils", () => {
  describe("formatSetNumber", () => {
    it("should prefix with # and remove -1 suffix", () => {
      expect(formatSetNumber("9441-1")).toBe("#9441")
    })

    it("should not prefix with # if includeHashtag is false", () => {
      expect(formatSetNumber("9441-1", false)).toBe("9441")
    })

    it("should format set number with hashtag", () => {
      expect(formatSetNumber("9441")).toBe("#9441")
    })

    it("should not remove suffix if it is not -1", () => {
      expect(formatSetNumber("9441-2")).toBe("#9441-2")
    })
  })

  describe("getSetImageUrlCandidates", () => {
    it("should return Rebrickable first, then LEGO prod and Prod", () => {
      expect(getSetImageUrlCandidates("9441-1")).toEqual([
        "https://cdn.rebrickable.com/media/sets/9441-1.jpg",
        "https://www.lego.com/cdn/product-assets/product.img.pri/9441_prod.jpg?format=webply&fit=bounds&quality=60&width=500&height=500&dpr=2",
        "https://www.lego.com/cdn/product-assets/product.img.pri/9441_Prod.jpg?format=webply&fit=bounds&quality=60&width=500&height=500&dpr=2",
      ])
    })

    it("should keep a non -1 suffix on Rebrickable and LEGO paths", () => {
      const urls = getSetImageUrlCandidates("10294-2")

      expect(urls[0]).toBe("https://cdn.rebrickable.com/media/sets/10294-2.jpg")
      expect(urls[1]).toContain("/10294-2_prod.jpg?")
      expect(urls[2]).toContain("/10294-2_Prod.jpg?")
    })
  })

  describe("getSetImageUrl", () => {
    it("should return the Rebrickable candidate", () => {
      expect(getSetImageUrl("9441-1")).toBe(
        "https://cdn.rebrickable.com/media/sets/9441-1.jpg",
      )
    })
  })

  describe("getPartImageUrlCandidates", () => {
    it("should put default color 0 first without duplicating it", () => {
      expect(colorIdsFromPartUrls(getPartImageUrlCandidates("3001"))).toEqual([
        0, 15, 1, 4, 14, 72, 19,
      ])
    })

    it("should put a preferred common color first without duplicating it", () => {
      expect(
        colorIdsFromPartUrls(getPartImageUrlCandidates("3001", 4)),
      ).toEqual([4, 0, 15, 1, 14, 72, 19])
    })

    it("should put a preferred color not in the common list first", () => {
      expect(
        colorIdsFromPartUrls(getPartImageUrlCandidates("3001", 99)),
      ).toEqual([99, 0, 15, 1, 4, 14, 72, 19])
    })
  })

  describe("getFirstTwoLetters", () => {
    it("should return the first two letters uppercased", () => {
      expect(getFirstTwoLetters("Ninjago")).toBe("NI")
      expect(getFirstTwoLetters("ab")).toBe("AB")
    })

    it("should handle short and empty strings", () => {
      expect(getFirstTwoLetters("A")).toBe("A")
      expect(getFirstTwoLetters("")).toBe("")
    })
  })

  describe("theme color classes", () => {
    it("should wrap theme ids onto the five chart tokens", () => {
      expect(getThemeDotClassName(0)).toBe("bg-chart-1")
      expect(getThemeDotClassName(5)).toBe("bg-chart-1")
      expect(getThemeDotClassName(-1)).toBe("bg-chart-2")
      expect(getThemeTextClassName(0)).toBe("text-chart-1")
    })
  })
})
