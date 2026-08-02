"use client"

import { getPartImageUrlCandidates } from "@/lib/utils"
import CatalogAvatar, { type CatalogAvatarSize } from "./catalog-avatar"

type PartAvatarProps = {
  partNum: string
  colorId: number
  size?: CatalogAvatarSize
  className?: string
}

const PartAvatar = ({
  partNum,
  colorId,
  size = "default",
  className,
}: PartAvatarProps) => (
  <CatalogAvatar
    resetKey={`${partNum}-${colorId}`}
    imageUrls={getPartImageUrlCandidates(partNum, colorId)}
    fallbackLabel={partNum.slice(0, 4).toUpperCase()}
    fallbackClassName="text-muted-foreground bg-muted text-xs"
    size={size}
    className={className}
  />
)

export default PartAvatar
