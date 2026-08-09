import { TelaKanban } from '@/components/kanban/tela-kanban';
import { listarAtendimentos, listarClientes, listarConversas } from '@/lib/consultas';
import type { ItemQuadro } from '@/lib/tipos';

const PaginaKanban = async () => {
  const [atendimentos, clientes, conversas] = await Promise.all([
    listarAtendimentos(),
    listarClientes(),
    listarConversas(),
  ]);

  const nomes = new Map(clientes.map((c) => [c.id, c.nome]));
  const porCliente = new Map(conversas.map((c) => [c.clienteId, c]));

  const itens: ItemQuadro[] = atendimentos.map((atendimento) => ({
    atendimento,
    clienteNome: nomes.get(atendimento.clienteId) ?? 'Sem nome',
    conversa: porCliente.get(atendimento.clienteId),
  }));

  return <TelaKanban itens={itens} clientes={clientes} />;
};

export default PaginaKanban;
