import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Params = { public_id: string };

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { public_id } = await params;
    
    if (!public_id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la imagen' },
        { status: 400 }
      );
    }

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la imagen' },
      { status: 500 }
    );
  }
} 