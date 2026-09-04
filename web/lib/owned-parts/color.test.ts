import type { Color } from "@brick-match/shared-types"
import { describe, expect, it } from "vitest"
import { filterColorsByIds, isLightColor, toCssHex } from "./color"

describe("owned-parts/color", () => {
  describe("toCssHex", () => {
    it("should prefix rgb without a hash", () => {
      expect(toCssHex("FF0000")).toBe("#FF0000")
    })

    it("should leave an already-hashed value unchanged", () => {
      expect(toCssHex("#FF0000")).toBe("#FF0000")
    })
  })

  describe("isLightColor", () => {
    it.each([
      ["#FFFF00", true],
      ["#FFFFFF", true],
      ["FFFFFF", true],
      ["#C0C0C0", true],
      ["#000000", false],
      ["#808080", false],
    ] as const)("%s is light: %s", (hex, expected) => {
      expect(isLightColor(hex)).toBe(expected)
    })
  })

  describe("filterColorsByIds", () => {
    const colors: Color[] = [
      { colorId: 0, name: "Black", rgb: "05131D", isTrans: false },
      { colorId: 1, name: "Blue", rgb: "0055BF", isTrans: false },
      { colorId: 4, name: "Red", rgb: "C91A09", isTrans: false },
    ]

    it("should keep includeColorIds that are not in the part color list", () => {
      expect(filterColorsByIds(colors, [1], [4])).toEqual([
        colors[1],
        colors[2],
      ])
    })

    it("should include colorId 0", () => {
      expect(filterColorsByIds(colors, [0])).toEqual([colors[0]])
    })

    it("should return an empty array when nothing matches", () => {
      expect(filterColorsByIds(colors, [99])).toEqual([])
    })

    it("should preserve catalog order rather than the id list order", () => {
      expect(filterColorsByIds(colors, [4, 0])).toEqual([colors[0], colors[2]])
    })

    it("should include a color only once when it is in both id lists", () => {
      expect(filterColorsByIds(colors, [1, 4], [4])).toEqual([
        colors[1],
        colors[2],
      ])
    })

    it("should ignore includeColorIds that are not in the catalog", () => {
      expect(filterColorsByIds(colors, [1], [99])).toEqual([colors[1]])
    })
  })
})
