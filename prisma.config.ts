// O Prisma 7 nao le mais o .env sozinho, precisa ser carregado aqui.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Lido direto de process.env em vez do helper env() do Prisma, que lanca erro
// quando a variavel nao existe. O `prisma generate` roda na construcao da
// imagem Docker, onde nao ha banco nenhum, e nao deveria falhar por isso.
// Comandos que realmente precisam da URL (migrate, studio) reclamam sozinhos.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
