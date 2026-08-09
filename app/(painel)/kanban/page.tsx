import { TelaKanban } from '@/components/kanban/tela-kanban';
import { listarAtendimentos, listarClientes, listarConversas } from '@/lib/consultas';
import { camposPendentes } from '@/lib/funil';
import { lerSessao } from '@/lib/sessao';
import { diasAte } from '@/lib/utils';
import type { ItemQuadro, Necessidade } from '@/lib/tipos';

type Busca = Promise<{ filtro?: string; necessidade?: string; origem?: string }>;

const PaginaKanban = async ({ searchParams }: { searchParams: Busca }) => {
  const { filtro, necessidade, origem } = await searchParams;

  const [atendimentos, clientes, conversas, sessao] = await Promise.all([
    listarAtendimentos(),
    listarClientes(),
    listarConversas(),
    lerSessao(),
  ]);

  const nomes = new Map(clientes.map((c) => [c.id, c.nome]));
  const porCliente = new Map(conversas.map((c) => [c.clienteId, c]));

  const filtrados = atendimentos
    .filter((a) => {
      if (filtro === 'meus') return a.responsavel === sessao?.nome;

      const aberto = a.etapa !== 'finalizado' && a.etapa !== 'perdido';

      if (filtro === 'urgentes') {
        if (!aberto || !a.dataEvento) return false;
        const dias = diasAte(a.dataEvento);
        return dias >= 0 && dias <= 7;
      }

      if (filtro === 'pendencias') {
        return aberto && camposPendentes(a.etapa, a.dados).length > 0;
      }

      return true;
    })
    .filter((a) => (necessidade ? a.necessidade === necessidade : true))
    .filter((a) => (origem ? a.origem === origem : true));

  const itens: ItemQuadro[] = filtrados.map((atendimento) => ({
    atendimento,
    clienteNome: nomes.get(atendimento.clienteId) ?? 'Sem nome',
    conversa: porCliente.get(atendimento.clienteId),
  }));

  return (
    <TelaKanban
      itens={itens}
      clientes={clientes}
      necessidade={necessidade as Necessidade | undefined}
    />
  );
};

export default PaginaKanban;
