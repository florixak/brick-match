import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/config"

export const runtime = "edge"
export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        gap: 16,
        padding: 64,
      }}
    >
      <h1 style={{ fontSize: 72, fontWeight: 700, margin: 0 }}>
        {siteConfig.name}
      </h1>
      <p style={{ fontSize: 32, opacity: 0.7, margin: 0, textAlign: "center" }}>
        {siteConfig.description}
      </p>
    </div>,
    { ...size },
  )
}
