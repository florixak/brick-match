import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

const siteIcons = {
  icon: [
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
  ],
  apple: "/apple-touch-icon.png",
  shortcut: "/favicon.ico",
} as const satisfies Metadata["icons"]

type MetadataProps = {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
  canonicalUrl?: string
}

export function createMetadata({
  title,
  description,
  image,
  noIndex,
  canonicalUrl,
}: MetadataProps = {}): Metadata {
  const resolvedTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name
  const resolvedDescription = description ?? siteConfig.description
  const resolvedImage = image ?? `${siteConfig.url}/og.png`

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    metadataBase: new URL(siteConfig.url),
    icons: siteIcons,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonicalUrl ?? siteConfig.url,
      siteName: siteConfig.name,
      images: [{ url: resolvedImage }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function createPageMetadata(props: MetadataProps): Metadata {
  return createMetadata(props)
}
