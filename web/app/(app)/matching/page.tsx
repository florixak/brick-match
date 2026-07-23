import Filters from "@/components/matching/filters"
import Hero from "@/components/matching/hero"
import MatchingResults from "@/components/matching/matching-results"

const MatchingPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 md:py-8">
      <Hero />
      <Filters />
      <MatchingResults />
    </div>
  )
}

export default MatchingPage
