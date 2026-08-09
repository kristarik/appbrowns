'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Etapa, ItemQuadro, Necessidade } from '@/lib/tipos';
import { etapasDaNecessidade } from '@/lib/funil';
import { cn, formatarMoeda } from '@/lib/utils';
import { Cartao } from './cartao';

type Props = {
  itens: ItemQuadro[];
  necessidade?: Necessidade;
  selecionado?: string;
  aoSelecionar: (id: string) => void;
  aoMover: (id: string, destino: Etapa) => void;
};

export const Quadro = ({ itens, necessidade, selecionado, aoSelecionar, aoMover }: Props) => {
  const [arrastando, setArrastando] = useState<string>();
  const [alvo, setAlvo] = useState<Etapa>();

  const soltar = (destino: Etapa) => (evento: React.DragEvent) => {
    evento.preventDefault();
    const id = evento.dataTransfer.getData('text/plain');

    if (id) aoMover(id, destino);

    setArrastando(undefined);
    setAlvo(undefined);
  };

  return (
    <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-4">
      {etapasDaNecessidade(necessidade).map((etapa) => {
        const daEtapa = itens.filter((i) => i.atendimento.etapa === etapa.id);
        const total = daEtapa.reduce((soma, i) => soma + (i.atendimento.valor ?? 0), 0);
        const destacada = alvo === etapa.id && arrastando !== undefined;

        return (
          <section key={etapa.id} className="flex w-64 shrink-0 flex-col">
            <header className="flex items-center gap-2 px-1 pt-1 pb-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: etapa.cor }}
              />
              <h3 className="truncate text-[13px] font-semibold tracking-tight text-texto">
                {etapa.nome}
              </h3>
              <span className="rounded bg-borda-suave px-1.5 text-[11px] font-medium text-texto-suave tabular-nums">
                {daEtapa.length}
              </span>

              {total > 0 && (
                <span className="ml-auto shrink-0 text-[11px] text-texto-fraco tabular-nums">
                  {formatarMoeda(total)}
                </span>
              )}
            </header>

            <div
              onDragOver={(evento) => {
                evento.preventDefault();
                evento.dataTransfer.dropEffect = 'move';
                setAlvo(etapa.id);
              }}
              onDragLeave={(evento) => {
                if (!evento.currentTarget.contains(evento.relatedTarget as Node)) {
                  setAlvo((atual) => (atual === etapa.id ? undefined : atual));
                }
              }}
              onDrop={soltar(etapa.id)}
              className={cn(
                'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl border-2 border-dashed p-2 transition-colors',
                destacada
                  ? 'border-marca bg-marca-fraca/50'
                  : 'border-transparent bg-borda-suave/50',
              )}
            >
              {daEtapa.map((item) => (
                <Cartao
                  key={item.atendimento.id}
                  item={item}
                  ativo={item.atendimento.id === selecionado}
                  arrastando={arrastando === item.atendimento.id}
                  aoSelecionar={() => aoSelecionar(item.atendimento.id)}
                  aoIniciarArraste={() => setArrastando(item.atendimento.id)}
                  aoTerminarArraste={() => {
                    setArrastando(undefined);
                    setAlvo(undefined);
                  }}
                />
              ))}

              {daEtapa.length === 0 && (
                <p className="px-2 py-6 text-center text-[12px] text-texto-fraco">
                  {destacada ? 'Solte aqui' : 'Nenhum atendimento'}
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
};
