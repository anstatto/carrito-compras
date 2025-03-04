import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface ImageInfo {
  name: string
  url: string
  module: string
  size: number
  createdAt: Date
  type: string
  public_id: string
}

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener lista de imágenes de Cloudinary
    const { resources } = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute()

    const images: ImageInfo[] = resources.map((resource: any) => ({
      name: resource.filename,
      url: resource.secure_url,
      module: resource.folder || 'productos',
      size: resource.bytes,
      createdAt: new Date(resource.created_at),
      type: resource.format,
      public_id: resource.public_id
    }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error al obtener imágenes:', error)
    return NextResponse.json(
      { error: 'Error al obtener imágenes' },
      { status: 500 }
    )
  }
} 