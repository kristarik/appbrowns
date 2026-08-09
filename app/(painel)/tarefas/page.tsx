import { ListaTarefas } from '@/components/tarefas/lista-tarefas';
import { listarTarefas } from '@/lib/consultas';

const PaginaTarefas = async () => {
  const tarefas = await listarTarefas();

  return <ListaTarefas tarefas={tarefas} />;
};

export default PaginaTarefas;
