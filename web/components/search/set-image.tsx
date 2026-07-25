"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import {
  cn,
  getFirstTwoLetters,
  getSetImageUrlCandidates,
  getThemeDotClassName,
} from "@/lib/utils"

const variantClasses = {
  sm: "size-12",
  md: "size-20",
  lg: "size-24",
  hero: "h-[280px] w-full",
} as const

const imageSizes = {
  sm: "48px",
  md: "80px",
  lg: "96px",
  hero: "(max-width: 640px) 100vw, 320px",
} as const

type SetImageProps = {
  setNum: string
  alt: string
  themeId?: number
  themeName?: string
  variant?: keyof typeof variantClasses
  className?: string
}

function SetImageContent({
  setNum,
  alt,
  themeId = 0,
  themeName,
  variant = "md",
  className,
}: SetImageProps) {
  const candidates = useMemo(() => getSetImageUrlCandidates(setNum), [setNum])
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)

  const showFallback = imageFailed

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-muted shadow-md",
        variantClasses[variant],
        className,
      )}
    >
      {showFallback && themeName ? (
        <div
          className={cn(
            "flex size-full items-center justify-center font-mono text-2xl font-extrabold text-primary-foreground",
            getThemeDotClassName(themeId),
            variant === "hero" && "text-4xl",
          )}
        >
          {getFirstTwoLetters(themeName)}
        </div>
      ) : (
        <Image
          src={candidates[candidateIndex]!}
          alt={alt}
          fill
          sizes={imageSizes[variant]}
          className="object-contain p-2"
          unoptimized
          onError={() => {
            if (candidateIndex < candidates.length - 1) {
              setCandidateIndex((index) => index + 1)
              return
            }
            setImageFailed(true)
          }}
        />
      )}
    </div>
  )
}

const SetImage = (props: SetImageProps) => (
  <SetImageContent key={props.setNum} {...props} />
)

export default SetImage
