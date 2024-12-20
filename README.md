Este es un proyecto [Next.js](https://nextjs.org) inicializado con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Comenzando

Primero, instala las dependencias:

```bash
npm install
```

Configura Prisma:

```bash
# Inicializa Prisma
npx prisma init

# Después de modificar tu schema.prisma, genera el cliente
npx prisma generate

# Para aplicar tus modelos a la base de datos
npx prisma db push

```

Ejecuta el servidor de desarrollo:

```bash
npm run dev

npm install next-auth @prisma/client bcryptjs
```

Luego, abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

### Dependencias principales
- @prisma/client - ORM para la base de datos
- axios - Para peticiones HTTP
- zustand - Manejo de estado
- @stripe/stripe-js - Para pagos