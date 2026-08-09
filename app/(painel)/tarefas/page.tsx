import { ListaTarefas } from '@/components/tarefas/lista-tarefas';
import { listarTarefas } from '@/lib/consultas';

type Busca = Promise<{ filtro?: string }>;

const PaginaTarefas = async ({ searchParams }: { searchParams: Busca }) => {
  const { filtro } = await searchParams;
  const tarefas = await listarTarefas();

  const agora = new Date();
  const fimDoDia = new Date(agora);
  fimDoDia.setHours(23, 59, 59, 999);

  const filtradas = tarefas.filter((t) => {
    if (filtro === 'atrasadas') return !t.concluida && new Date(t.venceEm) < agora;
    if (filtro === 'hoje')
      return !t.concluida && new Date(t.venceEm) >= agora && new Date(t.venceEm) <= fimDoDia;
    if (filtro === 'concluidas') return t.concluida;
    return true;
  });

  return <ListaTarefas tarefas={filtradas} />;
};

export default PaginaTarefas;
