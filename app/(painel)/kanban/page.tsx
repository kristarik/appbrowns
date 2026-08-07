'use client';

import { useState } from 'react';
import { PanelRightClose } from 'lucide-react';
import { Quadro } from '@/components/kanban/quadro';
import { PainelChat } from '@/components/chat/painel-chat';
import { DetalhesCliente } from '@/components/chat/detalhes-cliente';
import { NECESSIDADES, type Atendimento, type Etapa, type Necessidade } from '@/lib/tipos';
import { ATENDIMENTOS, conversaDoCliente } from '@/lib/dados-simulados';
import { cn, formatarMoeda } from '@/lib/utils';

const FILTROS: { id: Necessidade | 'todas'; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  ...(Object.entries(NECESSIDADES) as [Necessidade, string][]).map(([id, rotulo]) => ({
    id,
    rotulo,
  })),
];

const PaginaKanban = () => {
  // Copia local porque nao ha banco ainda: mover um card altera este estado e
  // some ao recarregar a pagina. Vira persistencia de verdade na v0.3.0.
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>(ATENDIMENTOS);
  const [necessidade, setNecessidade] = useState<Necessidade | 'todas'>('todas');
  const [selecionado, setSelecionado] = useState<string | undefined>();
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  const mover = (id: string, destino: Etapa) =>
    setAtendimentos((atual) =>
      atual.map((a) =>
        a.id === id
          ? { ...a, etapa: destino, atualizadoEm: new Date().toISOString() }
          : a,
      ),
    );

  const visiveis =
    necessidade === 'todas'
      ? atendimentos
      : atendimentos.filter((a) => a.necessidade === necessidade);

  const atendimento = visiveis.find((a) => a.id === selecionado);
  const conversa = atendimento ? conversaDoCliente(atendimento.clienteId) : undefined;
  const painelAberto = Boolean(atendimento && conversa);

  const emAberto = visiveis.filter((a) => a.etapa !== 'finalizado' && a.etapa !== 'perdido');
  const valorEmAberto = emAberto.reduce((soma, a) => soma + (a.valor ?? 0), 0);

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-texto">
              Funil de atendimento
            </h2>
            <p className="text-[12px] text-texto-suave">
              {emAberto.length} em aberto · {formatarMoeda(valorEmAberto)} em negociação
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-1">
            {FILTROS.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                onClick={() => setNecessidade(filtro.id)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                  necessidade === filtro.id
                    ? 'bg-marca-fraca font-medium text-marca'
                    : 'text-texto-suave hover:bg-borda-suave hover:text-texto',
                )}
              >
                {filtro.rotulo}
              </button>
            ))}

            {painelAberto && (
              <button
                type="button"
                onClick={() => {
                  setSelecionado(undefined);
                  setDetalhesAbertos(false);
                }}
                title="Fechar conversa e usar o quadro inteiro"
                className="ml-1 flex items-center gap-1.5 rounded-lg border border-borda bg-superficie px-2.5 py-1.5 text-[13px] text-texto-suave transition-colors hover:text-texto"
              >
                <PanelRightClose size={14} />
                Fechar conversa
              </button>
            )}
          </div>
        </header>

        <Quadro
          atendimentos={visiveis}
          necessidade={necessidade === 'todas' ? undefined : necessidade}
          selecionado={selecionado}
          aoSelecionar={setSelecionado}
          aoMover={mover}
        />
      </div>

      {painelAberto && atendimento && conversa && (
        <>
          <div className="flex w-[22rem] shrink-0 border-l border-borda">
            <PainelChat
              conversa={conversa}
              detalhesAbertos={detalhesAbertos}
              aoAlternarDetalhes={() => setDetalhesAbertos((aberto) => !aberto)}
            />
          </div>
          {detalhesAbertos && <DetalhesCliente clienteId={atendimento.clienteId} />}
        </>
      )}
    </div>
  );
};

export default PaginaKanban;
