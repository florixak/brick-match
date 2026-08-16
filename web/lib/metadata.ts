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
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: resolvedTitle }]
    : undefined

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
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function createPageMetadata(props: MetadataProps): Metadata {
  return createMetadata(props)
}
