import { CONTACT_EMAIL } from "@/lib/legal"

export default function ContactLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-primary font-semibold hover:underline"
    >
      {CONTACT_EMAIL}
    </a>
  )
}
