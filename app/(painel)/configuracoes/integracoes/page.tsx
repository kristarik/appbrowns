import { redirect } from 'next/navigation';
import { TelaIntegracoes } from '@/components/configuracoes/tela-integracoes';
import { listarIntegracoes } from '@/lib/consultas';
import { lerSessao } from '@/lib/sessao';

const PaginaIntegracoes = async () => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  const integracoes = await listarIntegracoes();

  return <TelaIntegracoes integracoes={integracoes} usuario={usuario} />;
};

export default PaginaIntegracoes;
