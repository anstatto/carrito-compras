import { NextResponse } from 'next/server'
import { unlink, rename } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const ALLOWED_DIRS = ['productos', 'categorias'] as const

interface FileParams {
  params: {
    name: string
  }
}

async function findFile(fileName: string): Promise<{ dir: string; path: string } | null> {
  const publicDir = join(process.cwd(), 'public')
  
  for (const dir of ALLOWED_DIRS) {
    const filePath = join(publicDir, dir, fileName)
    if (existsSync(filePath)) {
      return { dir, path: filePath }
    }
  }
  
  return null
}

export async function DELETE(
  request: Request, 
  { params }: { params: { name: string } }
) {
  try {
    const fileName = await Promise.resolve(params.name)
    const file = await findFile(fileName)
    
    if (!file) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }

    await unlink(file.path)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar archivo:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el archivo' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: FileParams) {
  try {
    const { newName } = await request.json()
    
    if (!newName || typeof newName !== 'string') {
      return NextResponse.json(
        { error: 'Nombre inválido' },
        { status: 400 }
      )
    }

    const file = await findFile(params.name)
    
    if (!file) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    const newPath = join(process.cwd(), 'public', file.dir, newName)
    
    if (existsSync(newPath)) {
      return NextResponse.json(
        { error: 'Ya existe un archivo con ese nombre' },
        { status: 400 }
      )
    }

    await rename(file.path, newPath)
    return NextResponse.json({ 
      success: true,
      url: `/${file.dir}/${newName}`
    })
  } catch (error) {
    console.error('Error al renombrar imagen:', error)
    return NextResponse.json(
      { error: 'Error al renombrar la imagen' },
      { status: 500 }
    )
  }
} 