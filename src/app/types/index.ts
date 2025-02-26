export interface Product {
  id: string;
  nombre: string;
  precio: string | number;
  cantidad: number;
  existencias: number;
  imagenes: { url: string }[];
}

export interface Client {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  role: "USER" | "ADMIN";
} 