import { siteConfig } from "@/lib/config"

export default function Footer() {
  return (
    <footer className="bg-footer border-border border-t">
      <div className="text-muted-foreground mx-auto flex h-14 max-w-7xl items-center justify-center px-4 text-xs sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
        reserved.
      </div>
    </footer>
  )
}
