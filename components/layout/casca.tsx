'use client';

import { useState, type ReactNode } from 'react';
import { BarraIcones } from './barra-icones';
import { Sidebar } from './sidebar';

export const Casca = ({ children }: { children: ReactNode }) => {
  const [recolhida, setRecolhida] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-fundo">
      <BarraIcones />
      <Sidebar recolhida={recolhida} aoAlternar={() => setRecolhida((r) => !r)} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
};
