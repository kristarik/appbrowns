import type { ReactNode } from 'react';
import type { Fatia } from '@/lib/relatorios';
import { formatarMoeda } from '@/lib/utils';

export const Indicador = ({
  rotulo,
  valor,
  apoio,
  destaque,
}: {
  rotulo: string;
  valor: string;
  apoio?: string;
  destaque?: boolean;
}) => (
  <div className="rounded-2xl border border-borda bg-superficie px-4 py-3.5">
    <p className="text-[11px] font-medium tracking-wide text-texto-fraco uppercase">
      {rotulo}
    </p>
    <p
      className={`mt-1 text-[22px] leading-none font-semibold tracking-tight tabular-nums ${
        destaque ? 'text-marca' : 'text-texto'
      }`}
    >
      {valor}
    </p>
    {apoio && <p className="mt-1 text-[12px] text-texto-suave">{apoio}</p>}
  </div>
);

export const Bloco = ({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-borda bg-superficie">
    <header className="border-b border-borda px-5 py-3.5">
      <h3 className="text-[14px] font-semibold tracking-tight text-texto">{titulo}</h3>
      {descricao && <p className="mt-0.5 text-[12px] text-texto-suave">{descricao}</p>}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

export const Vazio = ({ texto }: { texto: string }) => (
  <p className="py-6 text-center text-[13px] text-texto-fraco">{texto}</p>
);

// Barras em CSS puro. Uma biblioteca de graficos aqui adicionaria centenas de
// kilobytes ao navegador para desenhar retangulos proporcionais.
export const Barras = ({
  fatias,
  mostrarValor = true,
  vazio = 'Sem dados no período',
}: {
  fatias: Fatia[];
  mostrarValor?: boolean;
  vazio?: string;
}) => {
  if (fatias.length === 0) return <Vazio texto={vazio} />;

  const maior = Math.max(...fatias.map((f) => f.total), 1);

  return (
    <ul className="flex flex-col gap-3">
      {fatias.map((fatia) => (
        <li key={fatia.rotulo}>
          <div className="flex items-baseline justify-between gap-3 pb-1">
            <span className="truncate text-[13px] text-texto">{fatia.rotulo}</span>
            <span className="shrink-0 text-[12px] text-texto-suave tabular-nums">
              {fatia.total}
              {mostrarValor && fatia.valor > 0 && (
                <span className="ml-2 font-medium text-texto">
                  {formatarMoeda(fatia.valor)}
                </span>
              )}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-borda-suave">
            <div
              className="h-full rounded-full bg-marca transition-all"
              style={{ width: `${(fatia.total / maior) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export const Funil = ({
  etapas,
}: {
  etapas: { rotulo: string; cor: string; total: number; valor: number }[];
}) => {
  const maior = Math.max(...etapas.map((e) => e.total), 1);
  const total = etapas.reduce((soma, e) => soma + e.total, 0);

  if (total === 0) return <Vazio texto="Nenhum atendimento no período" />;

  return (
    <ul className="flex flex-col gap-2.5">
      {etapas.map((etapa) => (
        <li key={etapa.rotulo} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-[13px] text-texto">{etapa.rotulo}</span>

          <div className="h-6 flex-1 overflow-hidden rounded-lg bg-borda-suave">
            <div
              className="flex h-full items-center rounded-lg px-2 transition-all"
              style={{
                width: `${Math.max((etapa.total / maior) * 100, etapa.total > 0 ? 6 : 0)}%`,
                backgroundColor: etapa.cor,
              }}
            >
              {etapa.total > 0 && (
                <span className="text-[11px] font-semibold text-white tabular-nums">
                  {etapa.total}
                </span>
              )}
            </div>
          </div>

          <span className="w-24 shrink-0 text-right text-[12px] text-texto-suave tabular-nums">
            {etapa.valor > 0 ? formatarMoeda(etapa.valor) : '—'}
          </span>
        </li>
      ))}
    </ul>
  );
};

export const Colunas = ({
  meses,
  moeda = true,
  vazio = 'Nenhuma venda finalizada no período',
}: {
  meses: { rotulo: string; total: number; valor: number }[];
  moeda?: boolean;
  vazio?: string;
}) => {
  if (meses.length === 0) return <Vazio texto={vazio} />;

  const maior = Math.max(...meses.map((m) => m.valor), 1);

  const rotular = (valor: number) =>
    moeda
      ? formatarMoeda(valor).replace('R$ ', '')
      : valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  return (
    <div className="flex h-44 items-end gap-2">
      {meses.map((mes) => (
        <div key={mes.rotulo} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] text-texto-suave tabular-nums">
            {mes.valor > 0 ? rotular(mes.valor) : ''}
          </span>
          <div
            className="w-full rounded-t-md bg-marca transition-all"
            style={{ height: `${Math.max((mes.valor / maior) * 100, mes.valor > 0 ? 4 : 1)}%` }}
          />
          <span className="truncate text-[10px] text-texto-fraco">{mes.rotulo}</span>
        </div>
      ))}
    </div>
  );
};
