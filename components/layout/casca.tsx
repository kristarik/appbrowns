'use client';

import { useState, type ReactNode } from 'react';
import { BarraIcones } from './barra-icones';
import { Sidebar } from './sidebar';
import { montarNavegacao } from './navegacao';
import type { Contagens, ConfiguracaoGeral } from '@/lib/consultas';
import type { Sessao } from '@/lib/sessao';
import { tomClaro, tomEscuro } from '@/lib/utils';

type Props = {
  usuario: Sessao;
  contagens: Contagens;
  configuracao: ConfiguracaoGeral;
  children: ReactNode;
};

export const Casca = ({ usuario, contagens, configuracao, children }: Props) => {
  const [recolhida, setRecolhida] = useState(false);

  // Montado aqui, e nao no servidor, porque a navegacao carrega componentes de
  // icone e funcoes nao atravessam a fronteira servidor/cliente.
  const navegacao = montarNavegacao(contagens, configuracao.nomeLoja, usuario.papel);

  // A cor escolhida em Configuracoes sobrescreve as variaveis do tema. O valor
  // e validado como #rrggbb na acao que salva, entao nao ha injecao possivel.
  const tema = `:root{--marca:${configuracao.corMarca};--marca-escura:${tomEscuro(
    configuracao.corMarca,
  )};--marca-fraca:${tomClaro(configuracao.corMarca)}}`;

  return (
    <div className="flex h-dvh overflow-hidden bg-fundo">
      <style dangerouslySetInnerHTML={{ __html: tema }} />

      <BarraIcones usuario={usuario} navegacao={navegacao} configuracao={configuracao} />
      <Sidebar
        navegacao={navegacao}
        recolhida={recolhida}
        aoAlternar={() => setRecolhida((r) => !r)}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
};
