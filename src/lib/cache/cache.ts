// cache.ts
interface UserCache {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: "USER" | "ADMIN";
  activo: boolean;
  creadoEl: string;
}

// Exportar un objeto que contiene usersCache
export const cache = {
  usersCache: null as UserCache[] | null,
};
