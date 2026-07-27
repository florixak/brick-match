import GuestShell from "@/components/layout/guest-shell"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <GuestShell className="py-16">{children}</GuestShell>
}
