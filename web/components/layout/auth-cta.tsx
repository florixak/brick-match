import { LogInIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCTA() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        <LogInIcon />
        Login
      </Button>
      <Button
        variant="secondary"
        nativeButton={false}
        render={<Link href="/register" />}
      >
        <UserPlusIcon />
        Register
      </Button>
    </div>
  )
}
