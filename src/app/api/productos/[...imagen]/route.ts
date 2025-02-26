import { NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'

export async function GET(
  request: Request,
  { params }: { params: { imagen: string[] } }
) {
  try {
    const imagePath = join(process.cwd(), 'public', 'productos', ...params.imagen)
    const imageBuffer = await readFile(imagePath)
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error al cargar imagen:', error)
    return NextResponse.json(
      { error: 'Imagen no encontrada' },
      { status: 404 }
    )
  }
} 