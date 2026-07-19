import { LogInIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCTA() {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Button
        variant="header"
        size="icon"
        nativeButton={false}
        render={<Link href="/login" aria-label="Login" />}
        className="md:h-8 md:w-auto md:px-2.5 md:gap-1.5"
      >
        <LogInIcon />
        <span className="hidden md:inline">Login</span>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        nativeButton={false}
        render={<Link href="/register" aria-label="Register" />}
        className="md:h-8 md:w-auto md:px-2.5 md:gap-1.5"
      >
        <UserPlusIcon />
        <span className="hidden md:inline">Register</span>
      </Button>
    </div>
  )
}
