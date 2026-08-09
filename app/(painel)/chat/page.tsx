import { TelaChat } from '@/components/chat/tela-chat';
import { listarAtendimentos, listarClientes, listarConversas } from '@/lib/consultas';

const PaginaChat = async () => {
  const [conversas, clientes, atendimentos] = await Promise.all([
    listarConversas(),
    listarClientes(),
    listarAtendimentos(),
  ]);

  return <TelaChat conversas={conversas} clientes={clientes} atendimentos={atendimentos} />;
};

export default PaginaChat;
