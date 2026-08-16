import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/config"

export const alt = `${siteConfig.name} — ${siteConfig.description}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const ogPng = await readFile(join(process.cwd(), "public/og.png"), "base64")
const ogSrc = `data:image/png;base64,${ogPng}`

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#f2f0eb",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: ImageResponse/Satori does not support next/image */}
      <img
        src={ogSrc}
        alt={alt}
        width={size.width}
        height={size.height}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
        }}
      />
    </div>,
    { ...size },
  )
}
