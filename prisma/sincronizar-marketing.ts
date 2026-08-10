/**
 * Atualiza as métricas de marketing lendo Google Analytics, Search Console e
 * Google Ads. Feito para rodar por agendamento no servidor, e também usado
 * pelo botão "Atualizar agora" do painel.
 *
 * Uso:  npm run sincronizar:marketing [dias]
 */
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

if (process.env.PRODUCAO === '1' && process.env.DATABASE_URL_PRODUCAO) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_PRODUCAO;
}

const main = async () => {
  const { sincronizarTudo } = await import('../lib/marketing/sincronizar');
  const dias = Number(process.argv[2] ?? 30);

  console.log(`Sincronizando os últimos ${dias} dias...\n`);

  const resultados = await sincronizarTudo(dias);

  for (const r of resultados) {
    console.log(`${r.ok ? 'OK  ' : 'ERRO'}  ${r.fonte}: ${r.detalhe}`);
  }

  process.exit(resultados.some((r) => !r.ok) ? 1 : 0);
};

main();
