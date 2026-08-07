'use client';

import { Plus } from 'lucide-react';
import { ETAPAS, type Atendimento } from '@/lib/tipos';
import { formatarMoeda } from '@/lib/utils';
import { Cartao } from './cartao';

type Props = {
  atendimentos: Atendimento[];
  selecionado?: string;
  aoSelecionar: (id: string) => void;
};

export const Quadro = ({ atendimentos, selecionado, aoSelecionar }: Props) => (
  <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-4">
    {ETAPAS.map((etapa) => {
      const daEtapa = atendimentos.filter((a) => a.etapa === etapa.id);
      const total = daEtapa.reduce((soma, a) => soma + (a.valor ?? 0), 0);

      return (
        <section key={etapa.id} className="flex w-72 shrink-0 flex-col">
          <header className="flex items-center gap-2 px-1 pt-1 pb-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: etapa.cor }}
            />
            <h3 className="text-[13px] font-semibold tracking-tight text-texto">
              {etapa.nome}
            </h3>
            <span className="rounded bg-borda-suave px-1.5 text-[11px] font-medium text-texto-suave tabular-nums">
              {daEtapa.length}
            </span>

            {total > 0 && (
              <span className="ml-auto text-[11px] text-texto-fraco tabular-nums">
                {formatarMoeda(total)}
              </span>
            )}
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl bg-borda-suave/50 p-2">
            {daEtapa.map((atendimento) => (
              <Cartao
                key={atendimento.id}
                atendimento={atendimento}
                ativo={atendimento.id === selecionado}
                aoSelecionar={() => aoSelecionar(atendimento.id)}
              />
            ))}

            {daEtapa.length === 0 && (
              <p className="px-2 py-6 text-center text-[12px] text-texto-fraco">
                Nenhum atendimento
              </p>
            )}

            <button
              type="button"
              className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-borda py-2 text-[12px] text-texto-fraco transition-colors hover:border-marca hover:text-marca"
            >
              <Plus size={13} />
              Adicionar
            </button>
          </div>
        </section>
      );
    })}
  </div>
);
