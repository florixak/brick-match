"use client"

import { usePathname } from "next/navigation"
import MatchingPageSkeleton from "@/components/skeletons/matching-page"
import OwnedPartsPageSkeleton from "@/components/skeletons/owned-parts-page"

function AuthLoadingSkeleton() {
  const pathname = usePathname()

  if (pathname.startsWith("/owned-parts")) {
    return <OwnedPartsPageSkeleton />
  }

  if (pathname.startsWith("/matching")) {
    return <MatchingPageSkeleton />
  }

  return <OwnedPartsPageSkeleton />
}

export default AuthLoadingSkeleton
