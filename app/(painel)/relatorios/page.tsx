import { EmConstrucao } from '@/components/layout/em-construcao';

const PaginaRelatorios = () => (
  <EmConstrucao
    titulo="Relatórios"
    descricao="Precisa de dados reais no banco para fazer sentido. Entra depois que as integrações estiverem gravando atendimentos."
    previsto={[
      'Atendimentos por necessidade',
      'Conversão por etapa do funil',
      'Motivos de perda',
      'Sazonalidade por tipo de evento',
      'Desempenho por atendente',
      'Faturamento por período',
    ]}
  />
);

export default PaginaRelatorios;
