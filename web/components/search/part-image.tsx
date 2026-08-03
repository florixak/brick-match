import {
  getPartImageUrlCandidates,
  PART_AVATAR_PREVIEW_COLOR_ID,
} from "@/lib/utils"
import CatalogImage, { type CatalogImageVariant } from "./catalog-image"

type PartImageProps = {
  partNum: string
  colorId?: number
  alt?: string
  variant?: CatalogImageVariant
  className?: string
}

const PartImage = ({
  partNum,
  colorId,
  alt = "",
  variant = "md",
  className,
}: PartImageProps) => {
  const resolvedColorId = colorId ?? PART_AVATAR_PREVIEW_COLOR_ID

  return (
    <CatalogImage
      resetKey={`${partNum}-${resolvedColorId}`}
      imageUrls={getPartImageUrlCandidates(partNum, resolvedColorId)}
      alt={alt}
      variant={variant}
      className={className}
      fallback={
        <div className="flex size-full items-center justify-center font-mono text-2xl font-extrabold text-muted-foreground">
          {partNum.slice(0, 4).toUpperCase()}
        </div>
      }
    />
  )
}

export default PartImage
