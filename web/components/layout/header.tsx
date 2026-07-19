import { ToyBrick } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import AuthCTA from "./auth-cta"
import Navigation from "./navigation"

export default function Header() {
  return (
    <header className="bg-primary border-border sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg font-semibold transition-colors hover:opacity-90"
          >
            <ToyBrick className="size-8 bg-accent p-1 rounded-lg text-accent-foreground" />
            <span className="text-xl font-medium text-primary-foreground">
              BrickMatch
            </span>
          </Link>
          <Navigation />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthCTA />
        </div>
      </div>
    </header>
  )
}
