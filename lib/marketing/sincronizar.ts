import { db } from '../db';
import { diasAtras, emDia, paraData, tokenDeServico, tokenDoAds } from './google';
import type { FonteMetrica } from '../gerado/prisma';

type Ponto = { fonte: FonteMetrica; data: Date; metrica: string; valor: number };

const LOTE = 200;

const gravar = async (pontos: Ponto[]) => {
  if (pontos.length === 0) return 0;

  // Reimportar os mesmos dias corrige lacunas e valores que o Google ajusta
  // depois, entao a gravacao sobrescreve em vez de ignorar duplicata.
  //
  // Em lotes: uma transacao unica com milhares de comandos segura a conexao
  // por muito tempo e arrisca estourar o tempo limite do banco.
  for (let i = 0; i < pontos.length; i += LOTE) {
    await db.$transaction(
      pontos.slice(i, i + LOTE).map((p) =>
        db.metricaDiaria.upsert({
          where: { fonte_data_metrica: { fonte: p.fonte, data: p.data, metrica: p.metrica } },
          update: { valor: p.valor },
          create: { fonte: p.fonte, data: p.data, metrica: p.metrica, valor: p.valor },
        }),
      ),
    );
  }

  return pontos.length;
};

const METRICAS_GA4 = ['sessions', 'totalUsers', 'screenPageViews', 'keyEvents'];

export const sincronizarGa4 = async (dias: number) => {
  const propriedade = process.env.GA4_PROPERTY_ID;

  if (!propriedade) throw new Error('GA4_PROPERTY_ID não definido');

  const resposta = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propriedade}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await tokenDeServico()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: emDia(diasAtras(dias)), endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: METRICAS_GA4.map((name) => ({ name })),
      }),
    },
  );

  if (!resposta.ok) {
    throw new Error(`GA4 respondeu ${resposta.status}: ${(await resposta.text()).slice(0, 180)}`);
  }

  const dados = (await resposta.json()) as {
    rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
  };

  const pontos: Ponto[] = (dados.rows ?? []).flatMap((linha) =>
    METRICAS_GA4.map((metrica, indice) => ({
      fonte: 'ga4' as const,
      data: paraData(linha.dimensionValues[0].value),
      metrica,
      valor: Number(linha.metricValues[indice]?.value ?? 0),
    })),
  );

  return gravar(pontos);
};

export const sincronizarSearchConsole = async (dias: number) => {
  const site = process.env.GSC_SITE_URL;

  if (!site) throw new Error('GSC_SITE_URL não definido');

  const token = await tokenDeServico();
  const endereco = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    site,
  )}/searchAnalytics/query`;

  // O Search Console consolida com alguns dias de atraso, por isso a janela
  // termina tres dias atras: pedir "hoje" devolve zero e sujaria o grafico.
  const periodo = { startDate: emDia(diasAtras(dias)), endDate: emDia(diasAtras(3)) };

  const consultar = async (dimensions: string[], rowLimit: number) => {
    const resposta = await fetch(endereco, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...periodo, dimensions, rowLimit }),
    });

    if (!resposta.ok) {
      throw new Error(
        `Search Console respondeu ${resposta.status}: ${(await resposta.text()).slice(0, 180)}`,
      );
    }

    return (await resposta.json()) as {
      rows?: { keys: string[]; clicks: number; impressions: number; position: number }[];
    };
  };

  const porDia = await consultar(['date'], 500);

  const pontos: Ponto[] = (porDia.rows ?? []).flatMap((linha) => {
    const data = paraData(linha.keys[0]);

    return [
      { fonte: 'gsc' as const, data, metrica: 'clicks', valor: linha.clicks },
      { fonte: 'gsc' as const, data, metrica: 'impressions', valor: linha.impressions },
      { fonte: 'gsc' as const, data, metrica: 'position', valor: linha.position },
    ];
  });

  const gravadas = await gravar(pontos);

  let termos = 0;

  for (const dimensao of ['query', 'page'] as const) {
    const resultado = await consultar(['date', dimensao], 1000);

    for (const linha of resultado.rows ?? []) {
      await db.termoBusca.upsert({
        where: {
          dimensao_data_termo: {
            dimensao,
            data: paraData(linha.keys[0]),
            termo: linha.keys[1].slice(0, 600),
          },
        },
        update: {
          cliques: linha.clicks,
          impressoes: linha.impressions,
          posicao: linha.position,
        },
        create: {
          dimensao,
          data: paraData(linha.keys[0]),
          termo: linha.keys[1].slice(0, 600),
          cliques: linha.clicks,
          impressoes: linha.impressions,
          posicao: linha.position,
        },
      });
      termos += 1;
    }
  }

  return gravadas + termos;
};

export const sincronizarGoogleAds = async (dias: number) => {
  const { GADS_DEVELOPER_TOKEN, GADS_CUSTOMER_ID, GADS_LOGIN_CUSTOMER_ID } = process.env;
  const versao = process.env.GADS_API_VERSION ?? 'v24';

  if (!GADS_DEVELOPER_TOKEN || !GADS_CUSTOMER_ID) {
    throw new Error('Credenciais do Google Ads incompletas');
  }

  const cabecalhos: Record<string, string> = {
    Authorization: `Bearer ${await tokenDoAds()}`,
    'developer-token': GADS_DEVELOPER_TOKEN,
    'Content-Type': 'application/json',
  };

  if (GADS_LOGIN_CUSTOMER_ID) cabecalhos['login-customer-id'] = GADS_LOGIN_CUSTOMER_ID;

  const consulta = `
    SELECT segments.date, metrics.clicks, metrics.impressions,
           metrics.cost_micros, metrics.conversions
    FROM customer
    WHERE segments.date BETWEEN '${emDia(diasAtras(dias))}' AND '${emDia(new Date())}'
  `;

  const resposta = await fetch(
    `https://googleads.googleapis.com/${versao}/customers/${GADS_CUSTOMER_ID}/googleAds:searchStream`,
    { method: 'POST', headers: cabecalhos, body: JSON.stringify({ query: consulta }) },
  );

  if (!resposta.ok) {
    throw new Error(
      `Google Ads respondeu ${resposta.status}: ${(await resposta.text()).slice(0, 180)}`,
    );
  }

  const lotes = (await resposta.json()) as {
    results?: {
      segments: { date: string };
      metrics: {
        clicks?: string;
        impressions?: string;
        costMicros?: string;
        conversions?: number;
      };
    }[];
  }[];

  const pontos: Ponto[] = [];

  for (const lote of lotes) {
    for (const linha of lote.results ?? []) {
      const data = paraData(linha.segments.date);

      pontos.push(
        { fonte: 'google_ads', data, metrica: 'clicks', valor: Number(linha.metrics.clicks ?? 0) },
        {
          fonte: 'google_ads',
          data,
          metrica: 'impressions',
          valor: Number(linha.metrics.impressions ?? 0),
        },
        {
          fonte: 'google_ads',
          data,
          metrica: 'conversions',
          valor: Number(linha.metrics.conversions ?? 0),
        },
        // O Google devolve custo em micros: 1 real vira 1.000.000.
        {
          fonte: 'google_ads',
          data,
          metrica: 'spend',
          valor: Number(linha.metrics.costMicros ?? 0) / 1_000_000,
        },
      );
    }
  }

  return gravar(pontos);
};

export type ResultadoSincronia = {
  fonte: string;
  ok: boolean;
  detalhe: string;
};

export const sincronizarTudo = async (dias = 30): Promise<ResultadoSincronia[]> => {
  const tarefas: { fonte: string; executar: () => Promise<number> }[] = [
    { fonte: 'Google Analytics', executar: () => sincronizarGa4(dias) },
    { fonte: 'Search Console', executar: () => sincronizarSearchConsole(dias) },
    { fonte: 'Google Ads', executar: () => sincronizarGoogleAds(dias) },
  ];

  const resultados: ResultadoSincronia[] = [];

  // Sequencial e nao em paralelo: uma fonte que falha nao pode derrubar as
  // outras, e o relatorio prefere dado parcial a tela de erro.
  for (const tarefa of tarefas) {
    try {
      const total = await tarefa.executar();
      resultados.push({ fonte: tarefa.fonte, ok: true, detalhe: `${total} registros` });
    } catch (erro) {
      resultados.push({
        fonte: tarefa.fonte,
        ok: false,
        detalhe: erro instanceof Error ? erro.message : 'Falha desconhecida',
      });
    }
  }

  await db.sincronizacaoMarketing.upsert({
    where: { id: 'unica' },
    update: {
      rodadaEm: new Date(),
      resultado: resultados.map((r) => `${r.fonte}: ${r.detalhe}`).join(' | '),
      comErro: resultados.some((r) => !r.ok),
    },
    create: {
      id: 'unica',
      rodadaEm: new Date(),
      resultado: resultados.map((r) => `${r.fonte}: ${r.detalhe}`).join(' | '),
      comErro: resultados.some((r) => !r.ok),
    },
  });

  return resultados;
};
