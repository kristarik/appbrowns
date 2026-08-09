import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './gerado/prisma';

// Em desenvolvimento o Next recarrega os modulos a cada alteracao. Sem guardar
// a instancia no global, cada recarga abriria um pool novo e o Postgres estoura
// o limite de conexoes em poucos minutos.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

const obter = () => {
  if (globalParaPrisma.prisma) return globalParaPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) throw new Error('DATABASE_URL não definida');

  const cliente = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  if (process.env.NODE_ENV !== 'production') globalParaPrisma.prisma = cliente;

  return cliente;
};

// A conexao so e criada no primeiro uso, nunca ao importar o modulo. O
// `next build` importa as paginas para analisa-las, e nesse momento nao existe
// banco nenhum: dentro da imagem Docker a DATABASE_URL so chega no start.
export const db = new Proxy({} as PrismaClient, {
  get: (_alvo, propriedade) => {
    const cliente = obter();
    const valor = Reflect.get(cliente, propriedade, cliente);

    return typeof valor === 'function' ? valor.bind(cliente) : valor;
  },
});
