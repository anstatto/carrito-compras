export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF69B4] via-[#FF82AB] to-[#FF1493] flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
      <div className="relative w-full max-w-md mx-auto px-4">
        <div className="backdrop-blur-sm bg-white/95 rounded-2xl shadow-2xl p-8 border border-[#FFB6C1]/20">
          {children}
        </div>
      </div>
    </div>
  )
} 