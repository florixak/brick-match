import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// proxy.ts replaces middleware.ts in Next.js 16.
// Runs on the Node.js runtime (not Edge).
// Use for redirects and rewrites ONLY — do not add auth logic here.
// See: https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes

export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
