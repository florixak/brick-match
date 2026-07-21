import Filters from "@/components/owned-parts/filters"
import Hero from "@/components/owned-parts/hero"

const OwnedPartsPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Hero />
      <Filters />
    </div>
  )
}

export default OwnedPartsPage
