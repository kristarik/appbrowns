import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './gerado/prisma';

// Em desenvolvimento o Next recarrega os modulos a cada alteracao. Sem guardar
// a instancia no global, cada recarga abriria um pool novo e o Postgres estoura
// o limite de conexoes em poucos minutos.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

const criar = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) throw new Error('DATABASE_URL não definida');

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
};

export const db = globalParaPrisma.prisma ?? criar();

if (process.env.NODE_ENV !== 'production') globalParaPrisma.prisma = db;
