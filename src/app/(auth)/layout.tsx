export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto py-8">
        {children}
      </div>
    </div>
  )
} 