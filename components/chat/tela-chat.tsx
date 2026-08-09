'use client';

import { useState } from 'react';
import { MessageSquareOff } from 'lucide-react';
import { ListaConversas } from './lista-conversas';
import { PainelChat } from './painel-chat';
import { DetalhesCliente } from './detalhes-cliente';
import type { Atendimento, Cliente, Conversa } from '@/lib/tipos';

type Props = {
  conversas: Conversa[];
  clientes: Cliente[];
  atendimentos: Atendimento[];
};

export const TelaChat = ({ conversas, clientes, atendimentos }: Props) => {
  const [selecionada, setSelecionada] = useState(conversas[0]?.id ?? '');
  const [detalhesAbertos, setDetalhesAbertos] = useState(true);

  const conversa = conversas.find((c) => c.id === selecionada);
  const cliente = conversa ? clientes.find((c) => c.id === conversa.clienteId) : undefined;

  // O atendimento mais recente do cliente e o que a atendente esta tratando.
  const atendimento = cliente
    ? atendimentos.find((a) => a.clienteId === cliente.id)
    : undefined;

  return (
    <div className="flex h-full min-h-0">
      <ListaConversas
        conversas={conversas}
        selecionada={selecionada}
        aoSelecionar={setSelecionada}
      />

      {conversa && cliente ? (
        <>
          <PainelChat
            conversa={conversa}
            detalhesAbertos={detalhesAbertos}
            aoAlternarDetalhes={() => setDetalhesAbertos((aberto) => !aberto)}
          />
          {detalhesAbertos && (
            <DetalhesCliente cliente={cliente} atendimento={atendimento} />
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-superficie text-center">
          <MessageSquareOff size={22} className="text-texto-fraco" />
          <p className="text-[13px] text-texto-suave">Selecione uma conversa</p>
        </div>
      )}
    </div>
  );
};
