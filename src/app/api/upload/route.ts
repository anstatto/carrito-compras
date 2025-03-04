import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UploadApiOptions } from 'cloudinary'

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files')
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron archivos' }, { status: 400 })
    }

    const uploadPromises = files.map(async (file: FormDataEntryValue) => {
      if (!(file instanceof File)) {
        throw new Error('Invalid file type')
      }
      // Convertir el archivo a base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = file.type
      const dataURI = `data:${mimeType};base64,${base64}`

      const moduleValue = formData.get('module')
      const uploadFolder = typeof moduleValue === 'string' ? moduleValue : 'productos'

      const options: UploadApiOptions = {
        folder: uploadFolder,
        resource_type: 'auto'
      }

      const result = await cloudinary.uploader.upload(dataURI, options)

      return {
        name: file.name,
        url: result.secure_url,
        module: uploadFolder,
        size: result.bytes,
        createdAt: new Date(),
        type: file.type,
        public_id: result.public_id,
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)

    return NextResponse.json(uploadedFiles)
  } catch (error) {
    console.error('Error al subir archivos:', error)
    return NextResponse.json(
      { error: 'Error al procesar la subida de archivos' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false
  }
} 