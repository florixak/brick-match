import { debounce, parseAsString, parseAsStringLiteral } from "nuqs"
import { SEARCH_DEBOUNCE_MS } from "@/constants"

export const catalogSearchParams = {
  q: parseAsString.withDefault("").withOptions({
    limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS),
  }),
  mode: parseAsStringLiteral(["sets", "parts"]).withDefault("sets"),
}
