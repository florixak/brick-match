"use client"

import { LogInIcon, LogOutIcon, UserIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCurrentUser, useLogoutMutation } from "@/lib/queries"

export default function AuthCTA() {
  const { data: user, isPending: isUserPending } = useCurrentUser()
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()

  const isLoggedIn = !!user
  const name = user?.email.split("@")[0]

  const handleLogout = () => {
    logout()
  }

  if (isUserPending) {
    return null
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-1 md:gap-2">
        <UserIcon />
        <span className="md:inline text-sm font-semibold">{name}</span>
        <Button
          variant="header"
          size="icon"
          className="md:h-8 md:w-auto md:px-2.5 md:gap-1.5"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOutIcon />
        </Button>
      </div>
    )
  }
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
