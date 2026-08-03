import {
  cn,
  getFirstTwoLetters,
  getSetImageUrlCandidates,
  getThemeDotClassName,
} from "@/lib/utils"
import CatalogImage, { type CatalogImageVariant } from "./catalog-image"

type SetImageProps = {
  setNum: string
  alt: string
  themeId?: number
  themeName?: string
  variant?: CatalogImageVariant
  className?: string
}

const SetImage = ({
  setNum,
  alt,
  themeId = 0,
  themeName,
  variant = "md",
  className,
}: SetImageProps) => (
  <CatalogImage
    resetKey={setNum}
    imageUrls={getSetImageUrlCandidates(setNum)}
    alt={alt}
    variant={variant}
    className={className}
    fallback={
      themeName ? (
        <div
          className={cn(
            "flex size-full items-center justify-center font-mono font-extrabold text-primary-foreground",
            getThemeDotClassName(themeId),
            variant === "hero" ? "text-4xl" : "text-2xl",
          )}
        >
          {getFirstTwoLetters(themeName)}
        </div>
      ) : undefined
    }
  />
)

export default SetImage
