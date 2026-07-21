import { cn } from "@/lib/utils"

type StudsProps = {
  count: number
  bgColorClassName?: string
}

const Studs = ({ count, bgColorClassName = "bg-primary" }: StudsProps) => {
  return (
    <div className="flex gap-3 mb-6 justify-center" aria-hidden>
      {[...Array(count)].map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative studs
          key={`stud-${i}`}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center",
            bgColorClassName,
          )}
          style={{ boxShadow: "0 4px 0 rgba(0,0,0,0.3)" }}
        >
          <div className="w-4.5 h-4.5 rounded-full bg-white/20" />
        </div>
      ))}
    </div>
  )
}

export default Studs
