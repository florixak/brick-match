import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: string
  subtitle: string
  type: "login" | "register"
  children: React.ReactNode
}

const AuthCard = ({ title, subtitle, type, children }: AuthCardProps) => {
  const bgColorClassName = type === "login" ? "bg-primary" : "bg-accent"
  return (
    <div
      className="bg-card rounded-3xl border-2 border-border overflow-hidden"
      style={{ boxShadow: "0 8px 0 rgba(0,0,0,0.15)" }}
    >
      <div className={cn("px-6 py-6", bgColorClassName)}>
        <h1 className="text-2xl font-black text-white mt-2">{title}</h1>
        <p className="text-white/70 text-sm font-semibold mt-1">{subtitle}</p>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

export default AuthCard
