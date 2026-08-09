import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Casca } from '@/components/layout/casca';
import { contarNavegacao } from '@/lib/consultas';
import { lerSessao } from '@/lib/sessao';

// O middleware so confere se existe cookie. A validacao da assinatura acontece
// aqui, no servidor: token forjado ou expirado cai fora neste ponto.
const LayoutPainel = async ({ children }: { children: ReactNode }) => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  const contagens = await contarNavegacao(usuario.nome);

  return (
    <Casca usuario={usuario} contagens={contagens}>
      {children}
    </Casca>
  );
};

export default LayoutPainel;
