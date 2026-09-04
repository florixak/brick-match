import type { Theme } from "@brick-match/shared-types"
import { describe, expect, it } from "vitest"
import { toThemeOptions } from "./utils"

describe("matching/utils", () => {
  describe("toThemeOptions", () => {
    it("should build ancestor labels for nested themes", () => {
      const themes: Theme[] = [
        { id: 1, name: "Theme 1", parentId: null },
        { id: 2, name: "Theme 2", parentId: 1 },
        { id: 3, name: "Theme 3", parentId: 2 },
      ]

      expect(toThemeOptions(themes)).toEqual([
        { value: 1, label: "Theme 1" },
        { value: 2, label: "Theme 1 > Theme 2" },
        { value: 3, label: "Theme 1 > Theme 2 > Theme 3" },
      ])
    })

    it("should return an empty array if there are no themes", () => {
      expect(toThemeOptions([])).toEqual([])
    })

    it("should sort options by the full ancestor label", () => {
      const themes: Theme[] = [
        { id: 1, name: "Ninjago", parentId: null },
        { id: 2, name: "City", parentId: null },
        { id: 3, name: "Ninjago Juniors", parentId: 1 },
      ]

      expect(toThemeOptions(themes)).toEqual([
        { value: 2, label: "City" },
        { value: 1, label: "Ninjago" },
        { value: 3, label: "Ninjago > Ninjago Juniors" },
      ])
    })

    it("should stop walking when a parent is missing from the list", () => {
      const themes: Theme[] = [
        { id: 5, name: "Orphan", parentId: 99 },
        { id: 1, name: "City", parentId: null },
      ]

      expect(toThemeOptions(themes)).toEqual([
        { value: 1, label: "City" },
        { value: 5, label: "Orphan" },
      ])
    })

    it("should stop walking when parent ids form a cycle", () => {
      const themes: Theme[] = [
        { id: 1, name: "A", parentId: 2 },
        { id: 2, name: "B", parentId: 1 },
      ]

      expect(toThemeOptions(themes)).toEqual([
        { value: 2, label: "A > B" },
        { value: 1, label: "B > A" },
      ])
    })

    it("should treat a theme that is its own parent as a root", () => {
      const themes: Theme[] = [{ id: 1, name: "Loop", parentId: 1 }]

      expect(toThemeOptions(themes)).toEqual([{ value: 1, label: "Loop" }])
    })
  })
})
