import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path, { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const uploadPath = formData.get('module') as string
    const customName = formData.get('name') as string
    
    if (!file || !uploadPath) {
      return NextResponse.json(
        { error: 'Se requiere archivo y módulo' },
        { status: 400 }
      )
    }

    // Validaciones
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande (máximo 5MB)' },
        { status: 400 }
      )
    }

    // Generar nombre único usando el nombre personalizado si existe
    const fileName = customName 
      ? `${customName}${path.extname(file.name)}`
      : `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

    const uploadDir = join(process.cwd(), 'public', uploadPath)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({
      url: `/${uploadPath}/${fileName}`
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false
  }
} 