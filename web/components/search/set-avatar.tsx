"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  cn,
  getFirstTwoLetters,
  getSetImageUrlCandidates,
  getThemeDotClassName,
} from "@/lib/utils"

type SetAvatarProps = {
  themeId: number
  themeName: string
  setNum: string
  size?: "default" | "lg"
}

const sizeClasses = {
  default: "size-10",
  lg: "size-16",
} as const

function SetAvatarContent({
  themeId,
  themeName,
  setNum,
  size = "default",
}: SetAvatarProps) {
  const candidates = useMemo(() => getSetImageUrlCandidates(setNum), [setNum])
  const [candidateIndex, setCandidateIndex] = useState(0)

  return (
    <Avatar
      key={`${setNum}-${candidateIndex}`}
      className={cn("rounded-lg shadow-md after:rounded-lg", sizeClasses[size])}
      size={size === "lg" ? "lg" : "default"}
    >
      <AvatarImage
        src={candidates[candidateIndex]}
        alt=""
        className="rounded-lg"
        onLoadingStatusChange={(status) => {
          if (status === "error") {
            setCandidateIndex((index) =>
              index < candidates.length - 1 ? index + 1 : index,
            )
          }
        }}
      />
      <AvatarFallback
        className={cn(
          "rounded-lg font-mono font-extrabold text-primary-foreground",
          getThemeDotClassName(themeId),
          "text-lg",
        )}
      >
        {getFirstTwoLetters(themeName)}
      </AvatarFallback>
    </Avatar>
  )
}

const SetAvatar = (props: SetAvatarProps) => (
  <SetAvatarContent key={props.setNum} {...props} />
)

export default SetAvatar
