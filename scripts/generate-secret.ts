import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

async function generateSecret() {
  try {
    // Genera una clave secreta aleatoria de 64 bytes
    const secret = crypto.randomBytes(64).toString('base64')
    
    // Prepara el contenido del archivo .env.local
    const envContent = `NEXTAUTH_SECRET=${secret}\nNEXTAUTH_URL=http://localhost:3000\n`
    
    // Escribe el archivo .env.local
    await fs.writeFile(path.join(process.cwd(), '.env.local'), envContent)
    
    console.log('✅ Archivo .env.local creado exitosamente')
    console.log('Secret generado:', secret)
  } catch (error) {
    console.error('❌ Error al generar el secret:', error)
  }
}

generateSecret() 