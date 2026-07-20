import { cn, getFirstTwoLetters, getThemeDotClassName } from "@/lib/utils"

type SetAvatarProps = {
  themeId: number
  themeName: string
  size?: "default" | "lg"
}

const sizeClasses = {
  default: "min-w-10 px-2 py-1 text-lg",
  lg: "min-w-16 px-4 py-3 text-3xl",
} as const

const SetAvatar = ({
  themeId,
  themeName,
  size = "default",
}: SetAvatarProps) => {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-mono font-extrabold text-primary-foreground shadow-md",
        getThemeDotClassName(themeId),
        sizeClasses[size],
      )}
    >
      {getFirstTwoLetters(themeName)}
    </span>
  )
}

export default SetAvatar
