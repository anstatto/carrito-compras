import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/emails/OrderConfirmationEmail';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface OrderEmailData {
  numero: string;
  items: Array<{
    producto: {
      nombre: string;
      precio: number;
    };
    cantidad: number;
  }>;
  total: number;
}

interface UserEmailData {
  email: string;
  name: string;
}

export async function sendOrderConfirmationEmail(
  order: OrderEmailData,
  user: UserEmailData
) {
  try {
    const emailHtml = await render(
      OrderConfirmationEmail({
        order,
        user
      })
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Confirmación de pedido #${order.numero}`,
      html: emailHtml,
    };

    console.log('Enviando email a:', user.email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return info;

  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}

// Función para verificar la conexión SMTP
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('Servidor SMTP listo para enviar emails');
    return true;
  } catch (error) {
    console.error('Error al verificar conexión SMTP:', error);
    return false;
  }
} 