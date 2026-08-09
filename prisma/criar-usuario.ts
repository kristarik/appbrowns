import { config } from 'dotenv';
import { createInterface, type Interface } from 'node:readline';

// O dotenv le apenas .env por padrao, mas a URL de producao mora no .env.local.
// Carregado primeiro porque o dotenv nao sobrescreve o que ja esta definido.
config({ path: '.env.local', quiet: true });
config({ quiet: true });
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/gerado/prisma';

// PRODUCAO=1 aponta para o banco de producao em vez do de desenvolvimento.
// Os dois ficam no mesmo Postgres do VPS, alcancado pelo tunel SSH.
const producao = process.env.PRODUCAO === '1';
const conexao = producao
  ? process.env.DATABASE_URL_PRODUCAO
  : process.env.DATABASE_URL;

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: conexao }),
});

type InterfaceComEscrita = Interface & { _writeToOutput: (texto: string) => void };

const perguntar = (texto: string, oculto = false): Promise<string> =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    rl.question(texto, (resposta) => {
      rl.close();
      if (oculto) process.stdout.write('\n');
      resolve(resposta.trim());
    });

    // Trocado depois do question para o texto da pergunta aparecer normalmente
    // e so o que for digitado virar asterisco.
    if (oculto) {
      (rl as InterfaceComEscrita)._writeToOutput = () => process.stdout.write('*');
    }
  });

const main = async () => {
  console.log(`Criar ou atualizar usuário do painel (${producao ? 'PRODUÇÃO' : 'desenvolvimento'})\n`);

  if (!conexao) {
    console.error(
      producao
        ? 'DATABASE_URL_PRODUCAO não definida no .env.local'
        : 'DATABASE_URL não definida',
    );
    process.exit(1);
  }

  const email = (await perguntar('E-mail: ')).toLowerCase();

  if (!email.includes('@')) {
    console.error('E-mail inválido.');
    process.exit(1);
  }

  const existente = await db.usuario.findUnique({ where: { email } });

  if (existente) {
    console.log(`Usuário já existe (${existente.nome}). A senha será trocada.`);
  }

  const nome = existente
    ? existente.nome
    : await perguntar('Nome: ');

  const senha = await perguntar('Senha: ', true);

  if (senha.length < 8) {
    console.error('A senha precisa ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  const confirmacao = await perguntar('Repita a senha: ', true);

  if (senha !== confirmacao) {
    console.error('As senhas não conferem.');
    process.exit(1);
  }

  const senhaHash = await hash(senha, 10);

  const usuario = await db.usuario.upsert({
    where: { email },
    update: { senhaHash, ativo: true },
    create: { email, nome, senhaHash, papel: 'admin' },
  });

  console.log(`\nPronto. ${usuario.nome} <${usuario.email}> como ${usuario.papel}.`);

  await db.$disconnect();
};

main().catch(async (erro) => {
  console.error(erro);
  await db.$disconnect();
  process.exit(1);
});
