'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Error Global:', error)

  return (
    <html>
      <body>
        <div className="p-4">
          <h1>Algo salió mal!</h1>
          <p>{error.message}</p>
          <button onClick={() => reset()}>Intentar de nuevo</button>
        </div>
      </body>
    </html>
  )
} 