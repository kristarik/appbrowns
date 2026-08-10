import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/gerado/prisma';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

const alvo = process.env.PRODUCAO === '1'
  ? process.env.DATABASE_URL_PRODUCAO
  : process.env.DATABASE_URL;

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: alvo }) });

const main = async () => {
  const atual = await db.configuracao.findUnique({ where: { id: 'unica' } });

  // Só aplica se ainda estiver no azul de fábrica, para não desfazer escolha
  // que já tenha sido feita pelo painel.
  if (atual && atual.corMarca !== '#1b6df0') {
    console.log(`ja personalizado (${atual.corMarca}), nada alterado`);
    await db.$disconnect();
    return;
  }

  const salvo = await db.configuracao.upsert({
    where: { id: 'unica' },
    update: { corMarca: '#4d322e', corSuave: '#fae9db', logoUrl: '/marca/logo.svg' },
    create: { id: 'unica', corMarca: '#4d322e', corSuave: '#fae9db', logoUrl: '/marca/logo.svg' },
  });

  console.log(`marca aplicada: ${salvo.corMarca} + ${salvo.corSuave}, logo ${salvo.logoUrl}`);

  await db.$disconnect();
};

main();
