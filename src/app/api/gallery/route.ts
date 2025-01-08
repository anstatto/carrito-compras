import { NextResponse } from 'next/server'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

interface ImageInfo {
  name: string
  url: string
  module: string
  size: number
  createdAt: Date
  type: string
}

const ALLOWED_DIRS = ['productos', 'categorias'] as const

const getImageType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return ext === 'jpg' ? 'jpeg' : ext
}

export async function GET() {
  try {
    const publicDir = join(process.cwd(), 'public')
    const images: ImageInfo[] = []

    ALLOWED_DIRS.forEach(dir => {
      const dirPath = join(publicDir, dir)
      try {
        const files = readdirSync(dirPath)
        files.forEach(file => {
          if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const filePath = join(dirPath, file)
            const stats = statSync(filePath)
            images.push({
              name: file,
              url: `/${dir}/${file}`,
              module: dir,
              size: stats.size,
              createdAt: stats.birthtime,
              type: getImageType(file)
            })
          }
        })
      } catch (error) {
        console.error(`Error leyendo directorio ${dir}:`, error)
      }
    })

    // Ordenar por fecha de creación, más recientes primero
    images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error al leer imágenes:', error)
    return NextResponse.json(
      { error: 'Error al leer imágenes' },
      { status: 500 }
    )
  }
} 