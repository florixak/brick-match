import Filters from "@/components/owned-parts/filters"
import Hero from "@/components/owned-parts/hero"
import List from "@/components/owned-parts/list"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Owned Parts",
  description: "A list of all the parts you own in your LEGO collection.",
})

const OwnedPartsPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Hero />
      <Filters />
      <List />
    </div>
  )
}

export default OwnedPartsPage
