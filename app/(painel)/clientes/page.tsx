import { TabelaClientes } from '@/components/clientes/tabela-clientes';
import { listarAtendimentos, listarClientes } from '@/lib/consultas';

const PaginaClientes = async () => {
  const [clientes, atendimentos] = await Promise.all([
    listarClientes(),
    listarAtendimentos(),
  ]);

  return <TabelaClientes clientes={clientes} atendimentos={atendimentos} />;
};

export default PaginaClientes;
