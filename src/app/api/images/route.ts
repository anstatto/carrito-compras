import { NextResponse } from 'next/server'
import { readdirSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const productosPath = join(process.cwd(), 'public/productos')
    const images = readdirSync(productosPath)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => `/productos/${file}`)

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error al leer imágenes:', error)
    return NextResponse.json(
      { error: 'Error al obtener imágenes' },
      { status: 500 }
    )
  }
} 