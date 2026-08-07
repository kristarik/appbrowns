'use client';

import { useState } from 'react';
import { ListaConversas } from '@/components/chat/lista-conversas';
import { PainelChat } from '@/components/chat/painel-chat';
import { DetalhesCliente } from '@/components/chat/detalhes-cliente';
import { CONVERSAS } from '@/lib/dados-simulados';

const PaginaChat = () => {
  const [selecionada, setSelecionada] = useState(CONVERSAS[0].id);
  const [detalhesAbertos, setDetalhesAbertos] = useState(true);

  const conversa = CONVERSAS.find((c) => c.id === selecionada) ?? CONVERSAS[0];

  return (
    <div className="flex h-full min-h-0">
      <ListaConversas
        conversas={CONVERSAS}
        selecionada={selecionada}
        aoSelecionar={setSelecionada}
      />

      <PainelChat
        conversa={conversa}
        detalhesAbertos={detalhesAbertos}
        aoAlternarDetalhes={() => setDetalhesAbertos((aberto) => !aberto)}
      />

      {detalhesAbertos && <DetalhesCliente conversa={conversa} />}
    </div>
  );
};

export default PaginaChat;
