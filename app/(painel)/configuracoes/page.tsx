import { EmConstrucao } from '@/components/layout/em-construcao';

const PaginaConfiguracoes = () => (
  <EmConstrucao
    titulo="Configurações"
    descricao="Entra junto com o banco de dados, porque tudo aqui precisa ser salvo em algum lugar."
    previsto={[
      'Dados da loja e logo',
      'Credenciais do WhatsApp Cloud API',
      'Credenciais do Bling',
      'Usuários e permissões',
      'Etapas do funil personalizadas',
    ]}
  />
);

export default PaginaConfiguracoes;
