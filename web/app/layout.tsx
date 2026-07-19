import type { Metadata } from "next"
import { JetBrains_Mono, Nunito } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import { NuqsAdapter } from "nuqs/adapters/next"
import Footer from "@/components/layout/footer"
import Header from "@/components/layout/header"
import MobileNavigation from "@/components/layout/mobile-navigation"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { createMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = createMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        nunito.variable,
        jetbrainsMono.variable,
        "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NuqsAdapter>
              <Header />
              <main className="flex-1 py-16 md:pb-0 overflow-x-hidden">
                {children}
              </main>
              <Footer />
              <MobileNavigation />
              <Toaster position="bottom-right" />
            </NuqsAdapter>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
