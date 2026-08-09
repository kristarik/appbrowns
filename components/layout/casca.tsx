'use client';

import { useState, type ReactNode } from 'react';
import { BarraIcones } from './barra-icones';
import { Sidebar } from './sidebar';
import type { Sessao } from '@/lib/sessao';

type Props = {
  usuario: Sessao;
  children: ReactNode;
};

export const Casca = ({ usuario, children }: Props) => {
  const [recolhida, setRecolhida] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-fundo">
      <BarraIcones usuario={usuario} />
      <Sidebar recolhida={recolhida} aoAlternar={() => setRecolhida((r) => !r)} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
};
