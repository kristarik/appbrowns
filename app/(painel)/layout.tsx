import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Casca } from '@/components/layout/casca';
import { contarNavegacao, usuarioAtivo } from '@/lib/consultas';
import { lerSessao } from '@/lib/sessao';

// O middleware so confere se existe cookie. A validacao da assinatura acontece
// aqui, no servidor: token forjado ou expirado cai fora neste ponto.
const LayoutPainel = async ({ children }: { children: ReactNode }) => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  // O cookie nao e apagado aqui porque so acao de servidor pode mexer em cookie.
  // Nao faz falta: enquanto o usuario nao existir ou estiver inativo, este
  // ponto rejeita o token a cada carregamento.
  if (!(await usuarioAtivo(usuario.id))) redirect('/login');

  const contagens = await contarNavegacao(usuario.nome);

  return (
    <Casca usuario={usuario} contagens={contagens}>
      {children}
    </Casca>
  );
};

export default LayoutPainel;
