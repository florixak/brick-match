"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type CatalogAvatarSize = "default" | "lg" | "xl"

export const catalogAvatarSizeClasses: Record<CatalogAvatarSize, string> = {
  default: "size-10",
  lg: "size-16",
  xl: "size-24",
}

type CatalogAvatarProps = {
  imageUrls: string[]
  fallbackLabel: string
  fallbackClassName: string
  size?: CatalogAvatarSize
  className?: string
}

const CatalogAvatarContent = ({
  imageUrls,
  fallbackLabel,
  fallbackClassName,
  size = "default",
  className,
}: CatalogAvatarProps) => {
  const [candidateIndex, setCandidateIndex] = useState(0)
  const currentUrl = imageUrls[candidateIndex]

  return (
    <Avatar
      key={candidateIndex}
      className={cn(
        "rounded-lg shadow-md after:rounded-lg",
        catalogAvatarSizeClasses[size],
        className,
      )}
      size={size === "lg" ? "lg" : "default"}
    >
      {currentUrl !== undefined && (
        <AvatarImage
          src={currentUrl}
          alt=""
          className="rounded-lg object-contain"
          onLoadingStatusChange={(status) => {
            if (status === "error") {
              setCandidateIndex((i) => i + 1)
            }
          }}
        />
      )}
      <AvatarFallback
        className={cn("rounded-lg font-mono font-extrabold", fallbackClassName)}
      >
        {fallbackLabel}
      </AvatarFallback>
    </Avatar>
  )
}

type CatalogAvatarWithResetProps = CatalogAvatarProps & {
  resetKey: string
}

const CatalogAvatar = ({ resetKey, ...props }: CatalogAvatarWithResetProps) => (
  <CatalogAvatarContent key={resetKey} {...props} />
)

export default CatalogAvatar
