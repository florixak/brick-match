"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NAV_LINKS } from "@/constants"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navigation" className="hidden items-center md:flex">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href.pathname
        const Icon = link.icon

        return (
          <Button
            key={link.href.pathname}
            variant="ghost"
            nativeButton={false}
            render={
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
              />
            }
            className={cn(
              "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground",
              isActive && "bg-primary-foreground/15",
            )}
          >
            <Icon />
            {link.label}
          </Button>
        )
      })}
    </nav>
  )
}
