import { redirect } from 'next/navigation';
import { TelaEquipe } from '@/components/configuracoes/tela-equipe';
import { listarUsuarios } from '@/lib/consultas';
import { lerSessao } from '@/lib/sessao';

const PaginaEquipe = async () => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  const usuarios = await listarUsuarios();

  return <TelaEquipe usuarios={usuarios} usuario={usuario} />;
};

export default PaginaEquipe;
