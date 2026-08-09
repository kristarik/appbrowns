import { redirect } from 'next/navigation';
import { TelaIntegracoes } from '@/components/configuracoes/tela-integracoes';
import { SemPermissao } from '@/components/layout/sem-permissao';
import { listarIntegracoes } from '@/lib/consultas';
import { gerenciarSistema } from '@/lib/permissoes';
import { lerSessao } from '@/lib/sessao';

const PaginaIntegracoes = async () => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  if (!gerenciarSistema(usuario.papel)) {
    return <SemPermissao papel={usuario.papel} precisa="só do administrador" />;
  }

  const integracoes = await listarIntegracoes();

  return <TelaIntegracoes integracoes={integracoes} usuario={usuario} />;
};

export default PaginaIntegracoes;
