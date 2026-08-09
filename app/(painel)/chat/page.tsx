import { TelaChat } from '@/components/chat/tela-chat';
import { listarAtendimentos, listarClientes, listarConversas } from '@/lib/consultas';
import { lerSessao } from '@/lib/sessao';

type Busca = Promise<{ filtro?: string; canal?: string; responsavel?: string }>;

const PaginaChat = async ({ searchParams }: { searchParams: Busca }) => {
  const { filtro, canal, responsavel } = await searchParams;

  const [conversas, clientes, atendimentos, sessao] = await Promise.all([
    listarConversas(),
    listarClientes(),
    listarAtendimentos(),
    lerSessao(),
  ]);

  const filtradas = conversas
    .filter((c) => {
      if (filtro === 'minhas') return c.responsavel === sessao?.nome;
      if (filtro === 'nao-atribuidas') return !c.responsavel;
      if (filtro === 'resolvidas') return c.status === 'resolvida';
      return true;
    })
    .filter((c) => (canal ? c.canal === canal : true))
    .filter((c) => (responsavel ? c.responsavel === responsavel : true));

  return (
    <TelaChat conversas={filtradas} clientes={clientes} atendimentos={atendimentos} />
  );
};

export default PaginaChat;
