import 'server-only';
import { db } from './db';
import { FUNIL } from './funil';
import { MOTIVOS_PERDA, NECESSIDADES, OCASIOES, ORIGENS } from './tipos';
import type { Periodo } from './periodos';

export { PERIODOS, type Periodo } from './periodos';

const desde = (periodo: Periodo) => {
  if (periodo === 'tudo') return undefined;

  const data = new Date();
  data.setDate(data.getDate() - Number(periodo));
  data.setHours(0, 0, 0, 0);

  return data;
};

export type Fatia = { rotulo: string; total: number; valor: number; cor?: string };

export type RelatorioComercial = {
  periodo: Periodo;
  totais: {
    atendimentos: number;
    emAberto: number;
    ganhos: number;
    perdidos: number;
    valorEmAberto: number;
    faturamento: number;
    ticketMedio: number;
    conversao: number;
  };
  funil: { rotulo: string; cor: string; total: number; valor: number }[];
  porInteresse: Fatia[];
  porOcasiao: Fatia[];
  porOrigem: Fatia[];
  porResponsavel: (Fatia & { ganhos: number; conversao: number })[];
  motivosPerda: Fatia[];
  porMes: { rotulo: string; total: number; valor: number }[];
  semDados: boolean;
};

const somar = (itens: { valor?: number | null }[]) =>
  itens.reduce((total, item) => total + Number(item.valor ?? 0), 0);

const agrupar = <T>(
  itens: T[],
  chave: (item: T) => string | undefined,
  rotulos: Record<string, string>,
): Fatia[] => {
  const mapa = new Map<string, { total: number; valor: number }>();

  for (const item of itens) {
    const id = chave(item);
    if (!id) continue;

    const atual = mapa.get(id) ?? { total: 0, valor: 0 };
    atual.total += 1;
    atual.valor += Number((item as { valor?: number | null }).valor ?? 0);
    mapa.set(id, atual);
  }

  return [...mapa.entries()]
    .map(([id, dados]) => ({ rotulo: rotulos[id] ?? id, ...dados }))
    .sort((a, b) => b.total - a.total);
};

export const montarComercial = async (periodo: Periodo): Promise<RelatorioComercial> => {
  const inicio = desde(periodo);

  const atendimentos = await db.atendimento.findMany({
    where: inicio ? { criadoEm: { gte: inicio } } : undefined,
    include: { responsavel: { select: { nome: true } } },
  });

  const simples = atendimentos.map((a) => ({
    etapa: a.etapa,
    necessidade: a.necessidade ?? undefined,
    ocasiao: a.ocasiao ?? undefined,
    origem: a.origem,
    motivoPerda: a.motivoPerda ?? undefined,
    responsavel: a.responsavel?.nome,
    valor: a.valor === null ? 0 : Number(a.valor),
    dataEvento: a.dataEvento,
  }));

  const ganhos = simples.filter((a) => a.etapa === 'finalizado');
  const perdidos = simples.filter((a) => a.etapa === 'perdido');
  const emAberto = simples.filter(
    (a) => a.etapa !== 'finalizado' && a.etapa !== 'perdido',
  );

  // Conversao so faz sentido sobre atendimentos que ja terminaram. Contar os que
  // ainda estao no funil como perda faria a taxa despencar sem motivo real.
  const decididos = ganhos.length + perdidos.length;
  const faturamento = somar(ganhos);

  const porResponsavel = [
    ...new Set(simples.map((a) => a.responsavel).filter(Boolean)),
  ].map((nome) => {
    const dele = simples.filter((a) => a.responsavel === nome);
    const ganhosDele = dele.filter((a) => a.etapa === 'finalizado');
    const perdidosDele = dele.filter((a) => a.etapa === 'perdido');
    const decididosDele = ganhosDele.length + perdidosDele.length;

    return {
      rotulo: nome as string,
      total: dele.length,
      valor: somar(ganhosDele),
      ganhos: ganhosDele.length,
      conversao: decididosDele > 0 ? (ganhosDele.length / decididosDele) * 100 : 0,
    };
  });

  const meses = new Map<string, { total: number; valor: number }>();

  for (const a of ganhos) {
    const referencia = a.dataEvento ?? new Date();
    const chave = `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, '0')}`;
    const atual = meses.get(chave) ?? { total: 0, valor: 0 };
    atual.total += 1;
    atual.valor += a.valor;
    meses.set(chave, atual);
  }

  return {
    periodo,
    totais: {
      atendimentos: simples.length,
      emAberto: emAberto.length,
      ganhos: ganhos.length,
      perdidos: perdidos.length,
      valorEmAberto: somar(emAberto),
      faturamento,
      ticketMedio: ganhos.length > 0 ? faturamento / ganhos.length : 0,
      conversao: decididos > 0 ? (ganhos.length / decididos) * 100 : 0,
    },
    funil: FUNIL.map((etapa) => {
      const dela = simples.filter((a) => a.etapa === etapa.id);
      return { rotulo: etapa.nome, cor: etapa.cor, total: dela.length, valor: somar(dela) };
    }),
    porInteresse: agrupar(simples, (a) => a.necessidade, NECESSIDADES),
    porOcasiao: agrupar(simples, (a) => a.ocasiao, OCASIOES),
    porOrigem: agrupar(simples, (a) => a.origem, ORIGENS),
    porResponsavel: porResponsavel.sort((a, b) => b.valor - a.valor),
    motivosPerda: agrupar(perdidos, (a) => a.motivoPerda, MOTIVOS_PERDA),
    porMes: [...meses.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([chave, dados]) => {
        const [ano, mes] = chave.split('-');
        return {
          rotulo: new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString('pt-BR', {
            month: 'short',
            year: '2-digit',
          }),
          ...dados,
        };
      }),
    semDados: simples.length === 0,
  };
};
