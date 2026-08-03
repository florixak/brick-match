"use client"

import Image from "next/image"
import { type ReactNode, useState } from "react"
import { cn } from "@/lib/utils"

export type CatalogImageVariant = "sm" | "md" | "lg" | "hero"

export const catalogImageVariantClasses: Record<CatalogImageVariant, string> = {
  sm: "size-12",
  md: "size-20",
  lg: "size-24",
  hero: "h-[280px] w-full",
}

const imageSizes: Record<CatalogImageVariant, string> = {
  sm: "48px",
  md: "80px",
  lg: "96px",
  hero: "(max-width: 640px) 100vw, 320px",
}

type CatalogImageProps = {
  /** Ordered list of image URLs to try. Falls through to fallback when exhausted. */
  imageUrls: string[]
  alt: string
  variant?: CatalogImageVariant
  className?: string
  /** Rendered when all imageUrls fail to load. */
  fallback?: ReactNode
  resetKey: string
}

function CatalogImageContent({
  imageUrls,
  alt,
  variant = "md",
  className,
  fallback,
}: Omit<CatalogImageProps, "resetKey">) {
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)

  const currentUrl = imageUrls[candidateIndex]
  const showFallback = imageFailed || currentUrl === undefined

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-muted shadow-md",
        catalogImageVariantClasses[variant],
        className,
      )}
    >
      {showFallback ? (
        (fallback ?? null)
      ) : (
        <Image
          src={currentUrl!}
          alt={alt}
          fill
          sizes={imageSizes[variant]}
          className="object-contain p-2"
          unoptimized
          onError={() => {
            if (candidateIndex < imageUrls.length - 1) {
              setCandidateIndex((i) => i + 1)
              return
            }
            setImageFailed(true)
          }}
          loading={variant === "hero" ? "eager" : "lazy"}
        />
      )}
    </div>
  )
}

const CatalogImage = ({ resetKey, ...props }: CatalogImageProps) => (
  <CatalogImageContent key={resetKey} {...props} />
)

export default CatalogImage
