'use client';

import { useState } from 'react';
import { Filter, MessageSquareOff, SlidersHorizontal } from 'lucide-react';
import { Quadro } from '@/components/kanban/quadro';
import { PainelChat } from '@/components/chat/painel-chat';
import { DetalhesCliente } from '@/components/chat/detalhes-cliente';
import { ATENDIMENTOS, CONVERSAS } from '@/lib/dados-simulados';
import { formatarMoeda } from '@/lib/utils';

const PaginaKanban = () => {
  const [selecionado, setSelecionado] = useState<string | undefined>(ATENDIMENTOS[0].id);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  const atendimento = ATENDIMENTOS.find((a) => a.id === selecionado);
  const conversa = atendimento
    ? CONVERSAS.find((c) => c.clienteId === atendimento.clienteId)
    : undefined;

  const emAberto = ATENDIMENTOS.filter(
    (a) => a.etapa !== 'finalizado' && a.etapa !== 'perdido',
  );
  const valorEmAberto = emAberto.reduce((soma, a) => soma + (a.valor ?? 0), 0);

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-texto">
              Funil de atendimento
            </h2>
            <p className="text-[12px] text-texto-suave">
              {emAberto.length} em aberto · {formatarMoeda(valorEmAberto)} em negociação
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-borda bg-superficie px-2.5 py-1.5 text-[13px] text-texto-suave transition-colors hover:text-texto"
            >
              <Filter size={14} />
              Filtros
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-borda bg-superficie px-2.5 py-1.5 text-[13px] text-texto-suave transition-colors hover:text-texto"
            >
              <SlidersHorizontal size={14} />
              Ordenar
            </button>
          </div>
        </header>

        <Quadro
          atendimentos={ATENDIMENTOS}
          selecionado={selecionado}
          aoSelecionar={setSelecionado}
        />
      </div>

      {conversa ? (
        <>
          <div className="flex w-[26rem] shrink-0 border-l border-borda">
            <PainelChat
              conversa={conversa}
              detalhesAbertos={detalhesAbertos}
              aoAlternarDetalhes={() => setDetalhesAbertos((aberto) => !aberto)}
            />
          </div>
          {detalhesAbertos && <DetalhesCliente conversa={conversa} />}
        </>
      ) : (
        <aside className="flex w-[26rem] shrink-0 flex-col items-center justify-center gap-2 border-l border-borda bg-superficie px-8 text-center">
          <MessageSquareOff size={22} className="text-texto-fraco" />
          <p className="text-[13px] text-texto-suave">
            Selecione um card para ver a conversa
          </p>
        </aside>
      )}
    </div>
  );
};

export default PaginaKanban;
