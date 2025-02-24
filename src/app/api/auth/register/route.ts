import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Crear una instancia de PrismaClient
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Obtener los datos del request
    const { email, password, name, telefono } = await request.json();

    // Validaciones básicas de campos requeridos
    if (!email || !password || !name || !telefono) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validación de formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no tiene un formato válido" },
        { status: 400 }
      );
    }


    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    await prisma.user.create({
      data: {
        nombre: name,
        apellido: '', // Puedes agregar apellido si es necesario
        email,
        telefono,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
