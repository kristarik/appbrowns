/**
 * Importa o histórico de marketing do projeto antigo (brownsreport, MySQL)
 * para o banco do painel. Roda uma vez; depois a sincronização cuida do resto.
 *
 * Uso:  npm run importar:marketing          (banco de desenvolvimento)
 *       PRODUCAO=1 npm run importar:marketing
 */
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type FonteMetrica } from '../lib/gerado/prisma';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

const CONFIG_ANTIGO =
  'D:/PROJETOS/CLAUDE/projetos/brownsreport/app/includes/config.php';

const alvo =
  process.env.PRODUCAO === '1'
    ? process.env.DATABASE_URL_PRODUCAO
    : process.env.DATABASE_URL;

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: alvo }) });

const pegar = (php: string, nome: string) =>
  php.match(new RegExp(`define\\('${nome}',\\s*'([^']*)'`))?.[1] ?? '';

const FONTES: Record<string, FonteMetrica> = {
  ga4: 'ga4',
  google_ads: 'google_ads',
  gsc: 'gsc',
};

const main = async () => {
  if (!existsSync(CONFIG_ANTIGO)) {
    console.error('Projeto antigo não encontrado. Nada a importar.');
    process.exit(1);
  }

  const php = readFileSync(CONFIG_ANTIGO, 'utf8');

  const antigo = await mysql.createConnection({
    host: pegar(php, 'DB_HOST'),
    user: pegar(php, 'DB_USER'),
    password: pegar(php, 'DB_PASS'),
    database: pegar(php, 'DB_NAME'),
    connectTimeout: 30000,
  });

  // 1) Refresh token do Google Ads, para não precisar reautorizar no Google.
  const [linhas] = await antigo.query<mysql.RowDataPacket[]>(
    "SELECT value FROM app_config WHERE name = 'gads_refresh_token'",
  );
  const refresh = linhas[0]?.value as string | undefined;

  if (refresh && !process.env.GADS_REFRESH_TOKEN) {
    appendFileSync('.env.local', `GADS_REFRESH_TOKEN="${refresh}"\n`);
    console.log(`refresh token do Google Ads recuperado (${refresh.length} caracteres)`);
  } else if (refresh) {
    console.log('refresh token já estava configurado');
  } else {
    console.log('nenhum refresh token encontrado no projeto antigo');
  }

  // 2) Métricas diárias.
  const [metricas] = await antigo.query<mysql.RowDataPacket[]>(
    'SELECT provider, `date`, metric, value FROM daily_metrics',
  );

  let gravadas = 0;

  for (let i = 0; i < metricas.length; i += 500) {
    const lote = metricas.slice(i, i + 500).flatMap((linha) => {
      const fonte = FONTES[linha.provider as string];
      if (!fonte) return [];

      return [
        {
          fonte,
          data: new Date(linha.date),
          metrica: linha.metric as string,
          valor: linha.value as string,
        },
      ];
    });

    const { count } = await db.metricaDiaria.createMany({ data: lote, skipDuplicates: true });
    gravadas += count;
  }

  console.log(`métricas diárias: ${gravadas} de ${metricas.length} importadas`);

  // 3) Termos de busca do Search Console.
  const [termos] = await antigo.query<mysql.RowDataPacket[]>(
    'SELECT dim, `date`, term, clicks, impressions, position FROM gsc_breakdown',
  );

  let termosGravados = 0;

  for (let i = 0; i < termos.length; i += 500) {
    const lote = termos.slice(i, i + 500).map((linha) => ({
      dimensao: linha.dim as string,
      data: new Date(linha.date),
      termo: String(linha.term).slice(0, 600),
      cliques: Number(linha.clicks ?? 0),
      impressoes: Number(linha.impressions ?? 0),
      posicao: String(linha.position ?? 0),
    }));

    const { count } = await db.termoBusca.createMany({ data: lote, skipDuplicates: true });
    termosGravados += count;
  }

  console.log(`termos de busca: ${termosGravados} de ${termos.length} importados`);

  await antigo.end();
  await db.$disconnect();
};

main().catch(async (erro) => {
  console.error(erro);
  await db.$disconnect();
  process.exit(1);
});
