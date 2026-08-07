import { EmConstrucao } from '@/components/layout/em-construcao';

const PaginaNotificacoes = () => (
  <EmConstrucao
    titulo="Notificações"
    descricao="Depende do WhatsApp conectado para ter eventos reais que valham um aviso."
    previsto={[
      'Nova mensagem em conversa não atribuída',
      'Evento do cliente se aproximando',
      'Atendimento parado há muito tempo em uma etapa',
      'Menção de outro atendente',
    ]}
  />
);

export default PaginaNotificacoes;
