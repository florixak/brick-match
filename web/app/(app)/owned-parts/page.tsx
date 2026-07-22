import Filters from "@/components/owned-parts/filters"
import Hero from "@/components/owned-parts/hero"
import List from "@/components/owned-parts/list"

const OwnedPartsPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 md:py-8">
      <Hero />
      <Filters />
      <List />
    </div>
  )
}

export default OwnedPartsPage
