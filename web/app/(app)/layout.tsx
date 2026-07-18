import AuthShell from "@/components/layout/auth-shell"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthShell>{children}</AuthShell>
}
