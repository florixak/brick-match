import type { ReactNode } from "react"

type LegalSectionProps = {
  id?: string
  title: string
  children: ReactNode
}

export default function LegalSection({
  id,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section id={id} className="mb-8">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  )
}
