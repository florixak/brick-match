import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/lib/config";

export default function Header() {
  return (
    <header className="bg-header border-border sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-foreground text-sm font-semibold">
          {siteConfig.name}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
