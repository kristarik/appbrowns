'use client';

import { useState, type ReactNode } from 'react';
import { BarraIcones } from './barra-icones';
import { Sidebar } from './sidebar';
import { montarNavegacao } from './navegacao';
import type { Contagens } from '@/lib/consultas';
import type { Sessao } from '@/lib/sessao';

type Props = {
  usuario: Sessao;
  contagens: Contagens;
  children: ReactNode;
};

export const Casca = ({ usuario, contagens, children }: Props) => {
  const [recolhida, setRecolhida] = useState(false);

  // Montado aqui, e nao no servidor, porque a navegacao carrega componentes de
  // icone e funcoes nao atravessam a fronteira servidor/cliente.
  const navegacao = montarNavegacao(contagens);

  return (
    <div className="flex h-dvh overflow-hidden bg-fundo">
      <BarraIcones usuario={usuario} navegacao={navegacao} />
      <Sidebar
        navegacao={navegacao}
        recolhida={recolhida}
        aoAlternar={() => setRecolhida((r) => !r)}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
};
