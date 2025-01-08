export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
      <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
      <div className="relative container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl p-8 border border-white/20">
          {children}
        </div>
      </div>
    </div>
  )
} 