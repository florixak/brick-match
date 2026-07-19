"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { MOBILE_NAV_LINKS } from "@/constants"
import { cn } from "@/lib/utils"

export default function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-5 z-50 mx-2 md:hidden"
    >
      <ButtonGroup className="w-full rounded-lg bg-card">
        {MOBILE_NAV_LINKS.map((link) => {
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
                "h-auto flex-1 flex-col gap-1 rounded-none py-2",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon />
              <span className="text-xs uppercase">{link.label}</span>
            </Button>
          )
        })}
      </ButtonGroup>
    </nav>
  )
}
