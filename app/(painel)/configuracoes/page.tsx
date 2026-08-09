import { redirect } from 'next/navigation';
import { TelaGeral } from '@/components/configuracoes/tela-geral';
import { buscarConfiguracao } from '@/lib/consultas';
import { lerSessao } from '@/lib/sessao';

const PaginaGeral = async () => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  const configuracao = await buscarConfiguracao();

  return <TelaGeral configuracao={configuracao} usuario={usuario} />;
};

export default PaginaGeral;
