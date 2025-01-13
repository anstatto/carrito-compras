/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tu-dominio-de-imagenes.com'], // Añade los dominios de tus imágenes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig 