"use client"

import {
  cn,
  getFirstTwoLetters,
  getSetImageUrlCandidates,
  getThemeDotClassName,
} from "@/lib/utils"
import CatalogAvatar, { type CatalogAvatarSize } from "./catalog-avatar"

type SetAvatarProps = {
  themeId: number
  themeName: string
  setNum: string
  size?: CatalogAvatarSize
}

const SetAvatar = ({
  themeId,
  themeName,
  setNum,
  size = "default",
}: SetAvatarProps) => (
  <CatalogAvatar
    resetKey={setNum}
    imageUrls={getSetImageUrlCandidates(setNum)}
    fallbackLabel={getFirstTwoLetters(themeName)}
    fallbackClassName={cn(
      "text-primary-foreground text-lg",
      getThemeDotClassName(themeId),
    )}
    size={size}
  />
)

export default SetAvatar
