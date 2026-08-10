import 'server-only';
import { db } from './db';
import type { Periodo } from './relatorios';

const desde = (periodo: Periodo) => {
  if (periodo === 'tudo') return new Date('2020-01-01T00:00:00.000Z');

  const data = new Date();
  data.setUTCDate(data.getUTCDate() - Number(periodo));
  data.setUTCHours(0, 0, 0, 0);

  return data;
};

export type SerieDia = { data: string; valor: number };

export type RelatorioMarketing = {
  periodo: Periodo;
  atualizadoEm?: string;
  avisoSincronia?: string;
  site: {
    sessoes: number;
    usuarios: number;
    paginas: number;
    eventosChave: number;
    porDia: SerieDia[];
  };
  ads: {
    cliques: number;
    impressoes: number;
    investido: number;
    conversoes: number;
    ctr: number;
    cpc: number;
    custoPorConversao: number;
    porDia: SerieDia[];
  };
  busca: {
    cliques: number;
    impressoes: number;
    posicaoMedia: number;
    termos: { termo: string; cliques: number; impressoes: number; posicao: number }[];
    paginas: { termo: string; cliques: number; impressoes: number; posicao: number }[];
  };
  origens: {
    rotulo: string;
    leads: number;
    ganhos: number;
    faturamento: number;
  }[];
  custoPorLead?: number;
  custoPorVenda?: number;
  semDados: boolean;
};

const somaPorMetrica = async (fonte: 'ga4' | 'google_ads' | 'gsc', inicio: Date) => {
  const linhas = await db.metricaDiaria.groupBy({
    by: ['metrica'],
    where: { fonte, data: { gte: inicio } },
    _sum: { valor: true },
    _avg: { valor: true },
  });

  const soma: Record<string, number> = {};
  const media: Record<string, number> = {};

  for (const linha of linhas) {
    soma[linha.metrica] = Number(linha._sum.valor ?? 0);
    media[linha.metrica] = Number(linha._avg.valor ?? 0);
  }

  return { soma, media };
};

const serie = async (
  fonte: 'ga4' | 'google_ads' | 'gsc',
  metrica: string,
  inicio: Date,
): Promise<SerieDia[]> => {
  const linhas = await db.metricaDiaria.findMany({
    where: { fonte, metrica, data: { gte: inicio } },
    orderBy: { data: 'asc' },
    select: { data: true, valor: true },
  });

  return linhas.map((l) => ({
    data: l.data.toISOString().slice(0, 10),
    valor: Number(l.valor),
  }));
};

const termosMaisFortes = async (dimensao: 'query' | 'page', inicio: Date) => {
  const linhas = await db.termoBusca.groupBy({
    by: ['termo'],
    where: { dimensao, data: { gte: inicio } },
    _sum: { cliques: true, impressoes: true },
    _avg: { posicao: true },
    orderBy: { _sum: { cliques: 'desc' } },
    take: 10,
  });

  return linhas.map((l) => ({
    termo: l.termo,
    cliques: Number(l._sum.cliques ?? 0),
    impressoes: Number(l._sum.impressoes ?? 0),
    posicao: Number(l._avg.posicao ?? 0),
  }));
};

export const montarMarketing = async (periodo: Periodo): Promise<RelatorioMarketing> => {
  const inicio = desde(periodo);

  const [ga4, ads, gsc, sessoesPorDia, investidoPorDia, termos, paginas, sincronia] =
    await Promise.all([
      somaPorMetrica('ga4', inicio),
      somaPorMetrica('google_ads', inicio),
      somaPorMetrica('gsc', inicio),
      serie('ga4', 'sessions', inicio),
      serie('google_ads', 'spend', inicio),
      termosMaisFortes('query', inicio),
      termosMaisFortes('page', inicio),
      db.sincronizacaoMarketing.findUnique({ where: { id: 'unica' } }),
    ]);

  // Cruzamento com o CRM: de cada origem, quantos viraram atendimento e quanto
  // faturaram. E o que liga o dinheiro gasto ao dinheiro que entrou.
  const atendimentos = await db.atendimento.findMany({
    where: { criadoEm: { gte: inicio } },
    select: { origem: true, etapa: true, valor: true },
  });

  const porOrigem = new Map<string, { leads: number; ganhos: number; faturamento: number }>();

  for (const a of atendimentos) {
    const atual = porOrigem.get(a.origem) ?? { leads: 0, ganhos: 0, faturamento: 0 };
    atual.leads += 1;

    if (a.etapa === 'finalizado') {
      atual.ganhos += 1;
      atual.faturamento += Number(a.valor ?? 0);
    }

    porOrigem.set(a.origem, atual);
  }

  const ROTULOS: Record<string, string> = {
    google_ads: 'Google Ads',
    instagram: 'Instagram',
    facebook: 'Facebook',
    indicacao: 'Indicação',
    passou_na_loja: 'Passou na loja',
    site: 'Site',
    outro: 'Outro',
  };

  const investido = ads.soma.spend ?? 0;
  const doAds = porOrigem.get('google_ads');

  const cliques = ads.soma.clicks ?? 0;
  const impressoes = ads.soma.impressions ?? 0;
  const conversoes = ads.soma.conversions ?? 0;

  return {
    periodo,
    atualizadoEm: sincronia?.rodadaEm?.toISOString(),
    avisoSincronia: sincronia?.comErro ? (sincronia.resultado ?? undefined) : undefined,
    site: {
      sessoes: ga4.soma.sessions ?? 0,
      usuarios: ga4.soma.totalUsers ?? 0,
      paginas: ga4.soma.screenPageViews ?? 0,
      eventosChave: ga4.soma.keyEvents ?? 0,
      porDia: sessoesPorDia,
    },
    ads: {
      cliques,
      impressoes,
      investido,
      conversoes,
      ctr: impressoes > 0 ? (cliques / impressoes) * 100 : 0,
      cpc: cliques > 0 ? investido / cliques : 0,
      custoPorConversao: conversoes > 0 ? investido / conversoes : 0,
      porDia: investidoPorDia,
    },
    busca: {
      cliques: gsc.soma.clicks ?? 0,
      impressoes: gsc.soma.impressions ?? 0,
      posicaoMedia: gsc.media.position ?? 0,
      termos,
      paginas,
    },
    origens: [...porOrigem.entries()]
      .map(([id, dados]) => ({ rotulo: ROTULOS[id] ?? id, ...dados }))
      .sort((a, b) => b.leads - a.leads),
    // Só faz sentido se houver lead marcado como vindo do Google Ads. Sem o
    // campo Origem preenchido, o investimento fica sem contrapartida.
    custoPorLead: doAds && doAds.leads > 0 ? investido / doAds.leads : undefined,
    custoPorVenda: doAds && doAds.ganhos > 0 ? investido / doAds.ganhos : undefined,
    semDados: ga4.soma.sessions === undefined && ads.soma.clicks === undefined,
  };
};
