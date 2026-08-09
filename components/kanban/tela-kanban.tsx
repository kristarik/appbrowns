'use client';

import { useOptimistic, useState, useTransition } from 'react';
import Link from 'next/link';
import { PanelRightClose } from 'lucide-react';
import { Quadro } from './quadro';
import { PainelChat } from '@/components/chat/painel-chat';
import { DetalhesCliente } from '@/components/chat/detalhes-cliente';
import { moverAtendimento } from '@/app/acoes';
import {
  NECESSIDADES,
  type Cliente,
  type Etapa,
  type ItemQuadro,
  type Necessidade,
} from '@/lib/tipos';
import { cn, formatarMoeda } from '@/lib/utils';

const FILTROS: { id?: Necessidade; rotulo: string; href: string }[] = [
  { rotulo: 'Todas', href: '/kanban' },
  ...(Object.entries(NECESSIDADES) as [Necessidade, string][]).map(([id, rotulo]) => ({
    id,
    rotulo,
    href: `/kanban?necessidade=${id}`,
  })),
];

type Props = {
  itens: ItemQuadro[];
  clientes: Cliente[];
  necessidade?: Necessidade;
};

export const TelaKanban = ({ itens, clientes, necessidade }: Props) => {
  const [selecionado, setSelecionado] = useState<string>();
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [, iniciar] = useTransition();

  // O card muda de coluna na hora, sem esperar a resposta do servidor. Se a
  // gravacao falhar, o React desfaz sozinho ao receber os dados reais.
  const [otimistas, aplicarMovimento] = useOptimistic(
    itens,
    (estado: ItemQuadro[], movimento: { id: string; destino: Etapa }) =>
      estado.map((item) =>
        item.atendimento.id === movimento.id
          ? { ...item, atendimento: { ...item.atendimento, etapa: movimento.destino } }
          : item,
      ),
  );

  const mover = (id: string, destino: Etapa) =>
    iniciar(async () => {
      aplicarMovimento({ id, destino });
      await moverAtendimento(id, destino);
    });

  // A filtragem por necessidade acontece no servidor, pela URL. Aqui so
  // repassamos o que chegou.
  const visiveis = otimistas;

  const escolhido = visiveis.find((i) => i.atendimento.id === selecionado);
  const cliente = escolhido
    ? clientes.find((c) => c.id === escolhido.atendimento.clienteId)
    : undefined;
  const painelAberto = Boolean(escolhido?.conversa && cliente);

  const emAberto = visiveis.filter(
    (i) => i.atendimento.etapa !== 'finalizado' && i.atendimento.etapa !== 'perdido',
  );
  const valorEmAberto = emAberto.reduce((soma, i) => soma + (i.atendimento.valor ?? 0), 0);

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
              <Link
                key={filtro.href}
                href={filtro.href}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                  necessidade === filtro.id
                    ? 'bg-marca-fraca font-medium text-marca'
                    : 'text-texto-suave hover:bg-borda-suave hover:text-texto',
                )}
              >
                {filtro.rotulo}
              </Link>
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
          itens={visiveis}
          necessidade={necessidade}
          selecionado={selecionado}
          aoSelecionar={setSelecionado}
          aoMover={mover}
        />
      </div>

      {painelAberto && escolhido?.conversa && cliente && (
        <>
          <div className="flex w-[22rem] shrink-0 border-l border-borda">
            <PainelChat
              conversa={escolhido.conversa}
              detalhesAbertos={detalhesAbertos}
              aoAlternarDetalhes={() => setDetalhesAbertos((aberto) => !aberto)}
            />
          </div>
          {detalhesAbertos && (
            <DetalhesCliente cliente={cliente} atendimento={escolhido.atendimento} />
          )}
        </>
      )}
    </div>
  );
};
