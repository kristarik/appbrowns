import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './gerado/prisma';

// Guardado no módulo: uma instância por processo, com um pool só. Sem isto cada
// acesso a `db` criava um cliente novo e o Postgres recusava por excesso de
// conexões depois de algumas centenas de operações.
let instancia: PrismaClient | undefined;

// Em desenvolvimento o Next recarrega os módulos a cada alteração, e a variável
// acima nasce vazia de novo. Por isso, ali, a instância também vai para o
// global, que sobrevive à recarga.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

const obter = () => {
  const guardada = instancia ?? globalParaPrisma.prisma;

  if (guardada) return guardada;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) throw new Error('DATABASE_URL não definida');

  const cliente = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  instancia = cliente;

  if (process.env.NODE_ENV !== 'production') globalParaPrisma.prisma = cliente;

  return cliente;
};

// A conexão só é criada no primeiro uso, nunca ao importar o módulo. O
// `next build` importa as páginas para analisá-las, e nesse momento não existe
// banco nenhum: dentro da imagem Docker a DATABASE_URL só chega no start.
export const db = new Proxy({} as PrismaClient, {
  get: (_alvo, propriedade) => {
    const cliente = obter();
    const valor = Reflect.get(cliente, propriedade, cliente);

    return typeof valor === 'function' ? valor.bind(cliente) : valor;
  },
});
