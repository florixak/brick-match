import Link from "next/link"
import { siteConfig } from "@/lib/config"

export default function Footer() {
  return (
    <footer className="bg-footer border-border border-t pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="text-muted-foreground mx-auto flex h-14 max-w-7xl flex-col items-center justify-center gap-1 px-4 text-xs sm:flex-row sm:justify-between sm:gap-0 sm:px-6 lg:px-8">
        <span>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <span aria-hidden="true">&middot;</span>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  )
}
