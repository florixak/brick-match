import Filters from "@/components/matching/filters"
import Hero from "@/components/matching/hero"
import MatchingResults from "@/components/matching/matching-results"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Matching",
  description: "Find sets that you can build from the parts you already own.",
})

const MatchingPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Hero />
      <Filters />
      <MatchingResults />
    </div>
  )
}

export default MatchingPage
