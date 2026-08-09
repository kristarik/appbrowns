// O Prisma 7 nao le mais o .env sozinho, precisa ser carregado aqui.
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// A partir do Prisma 7 a URL do banco sai do schema.prisma e vem para ca.
// O schema fica so com a estrutura, sem nada de ambiente.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
