import { TabelaClientes } from '@/components/clientes/tabela-clientes';
import { listarAtendimentos, listarClientes } from '@/lib/consultas';

type Busca = Promise<{ filtro?: string }>;

const PaginaClientes = async ({ searchParams }: { searchParams: Busca }) => {
  const { filtro } = await searchParams;

  const [clientes, atendimentos] = await Promise.all([
    listarClientes(),
    listarAtendimentos(),
  ]);

  const comAtendimentoAberto = new Set(
    atendimentos
      .filter((a) => a.etapa !== 'finalizado' && a.etapa !== 'perdido')
      .map((a) => a.clienteId),
  );

  const inicioDoMes = new Date();
  inicioDoMes.setDate(1);
  inicioDoMes.setHours(0, 0, 0, 0);

  const filtrados = clientes.filter((c) => {
    if (filtro === 'ativos') return comAtendimentoAberto.has(c.id);
    if (filtro === 'recentes') return new Date(c.criadoEm) >= inicioDoMes;
    return true;
  });

  return <TabelaClientes clientes={filtrados} atendimentos={atendimentos} />;
};

export default PaginaClientes;
