import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { nombre, email, mensaje } = await request.json()

    if (!process.env.EMAIL_PASSWORD) {
      throw new Error('EMAIL_PASSWORD no está configurado')
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'devrmconsuegra@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // Verificar la conexión
    await transporter.verify()

    // Enviar el email con mejor formato HTML
    await transporter.sendMail({
      from: `"Formulario de Contacto" <angeltatistorres@gmail.com>`,
      replyTo: `"${nombre}" <${email}>`,
      to: 'angeltatistorres@gmail.com',
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
          <h2 style="color: #FF69B4; margin-bottom: 20px;">Nuevo mensaje de contacto</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="margin: 0 0 10px;"><strong>Mensaje:</strong></p>
            <p style="margin: 0; line-height: 1.5;">${mensaje}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Este mensaje fue enviado desde el formulario de contacto de Arlin Glow Care.
          </p>
        </div>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Mensaje enviado correctamente'
    })
  } catch (error) {
    console.error('Error al enviar email:', error)
    return NextResponse.json(
      { 
        error: 'Error al enviar el mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 