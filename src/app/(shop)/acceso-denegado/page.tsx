import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-pink text-center p-8">
      <div className="max-w-lg">
        <h1 className="text-6xl font-bold text-primary-pink-dark mb-4">403</h1>
        <h2 className="text-4xl font-bold text-text-dark mb-4">
          Acceso Denegado
        </h2>
        <p className="text-xl text-text-muted mb-8">
          Lo sentimos, no tienes permiso para acceder a esta página.
        </p>
        <Link href="/">
          <span className="inline-block bg-primary-pink text-text-light py-3 px-8 rounded-lg text-lg font-bold transition-colors hover:bg-primary-pink-dark">
            Volver al Inicio
          </span>
        </Link>
      </div>
    </div>
  );
}
