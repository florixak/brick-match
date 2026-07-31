import { debounce, parseAsString, parseAsStringLiteral } from "nuqs"
import { CATALOG_SEARCH_DEBOUNCE_MS } from "@/constants"

export const catalogSearchParams = {
  q: parseAsString.withDefault("").withOptions({
    limitUrlUpdates: debounce(CATALOG_SEARCH_DEBOUNCE_MS),
  }),
  mode: parseAsStringLiteral(["sets", "parts"]).withDefault("sets"),
}
