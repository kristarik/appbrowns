import type { CampoEtapa, Etapa, Necessidade } from './tipos';

export type DefinicaoEtapa = {
  id: Etapa;
  nome: string;
  cor: string;
  // Vazio significa que a etapa vale para toda necessidade. Quando preenchido,
  // a coluna some do quadro ao filtrar por uma necessidade fora da lista:
  // aluguel nao passa por provas, sob medida nunca entra em locacao.
  necessidades: Necessidade[];
  campos: CampoEtapa[];
  followUps: string[];
};

export const FUNIL: DefinicaoEtapa[] = [
  {
    id: 'novo',
    nome: 'Novo',
    cor: '#1b6df0',
    necessidades: [],
    campos: [],
    followUps: [
      'Primeiro atendimento imediato',
      'Nova tentativa em algumas horas',
      'Nova tentativa no dia seguinte',
    ],
  },
  {
    id: 'atendimento-inicial',
    nome: 'Atendimento inicial',
    cor: '#7c3aed',
    necessidades: [],
    campos: [],
    followUps: ['Follow-ups consultivos até agendamento ou encerramento'],
  },
  {
    id: 'agendado',
    nome: 'Agendado',
    cor: '#0891b2',
    necessidades: [],
    campos: [
      { id: 'dataVisita', rotulo: 'Data e horário da visita', tipo: 'data-hora' },
      { id: 'consultor', rotulo: 'Consultor responsável', tipo: 'texto' },
      { id: 'presencaConfirmada', rotulo: 'Confirmação de presença', tipo: 'booleano' },
      { id: 'observacoes', rotulo: 'Observações do atendimento', tipo: 'texto-longo' },
      {
        id: 'origemAgendamento',
        rotulo: 'Origem do agendamento',
        tipo: 'opcao',
        opcoes: [
          { id: 'whatsapp', rotulo: 'WhatsApp' },
          { id: 'instagram', rotulo: 'Instagram' },
          { id: 'telefone', rotulo: 'Telefone' },
          { id: 'presencial', rotulo: 'Presencial' },
        ],
      },
    ],
    followUps: ['Lembrete 24 horas antes', 'Confirmação no dia da visita'],
  },
  {
    id: 'decidindo',
    nome: 'Decidindo',
    cor: '#ea8c00',
    necessidades: [],
    campos: [
      { id: 'dataVisitaRealizada', rotulo: 'Data da visita', tipo: 'data' },
      { id: 'produtosExperimentados', rotulo: 'Produtos experimentados', tipo: 'texto-longo' },
      { id: 'orcamentoApresentado', rotulo: 'Orçamento apresentado', tipo: 'moeda' },
      { id: 'objecaoPrincipal', rotulo: 'Objeção principal', tipo: 'texto' },
      { id: 'proximoContato', rotulo: 'Próxima data de contato', tipo: 'data' },
    ],
    followUps: [
      'Follow-up após a visita',
      'Novo contato alguns dias depois',
      'Último contato antes de perder',
    ],
  },
  {
    id: 'aguardando-retirada',
    nome: 'Aguardando retirada',
    cor: '#c026d3',
    necessidades: [],
    campos: [
      { id: 'vendaConfirmada', rotulo: 'Venda / locação confirmada', tipo: 'booleano' },
      { id: 'dataRetirada', rotulo: 'Data da retirada', tipo: 'data' },
      { id: 'horarioRetirada', rotulo: 'Horário agendado', tipo: 'texto' },
    ],
    followUps: [
      'Lembrete da retirada',
      'Confirmação da presença',
      'Reagendamento se necessário',
    ],
  },
  {
    id: 'em-provas',
    nome: 'Em provas e ajustes',
    cor: '#0d9488',
    necessidades: ['terno-sob-medida', 'camisa-sob-medida', 'ajuste'],
    campos: [
      { id: 'proximaProva', rotulo: 'Próxima prova agendada', tipo: 'data-hora' },
      { id: 'previsaoLiberacao', rotulo: 'Data prevista para liberação', tipo: 'data' },
    ],
    followUps: [
      'Lembrete de cada prova',
      'Confirmação de comparecimento',
      'Acompanhamento até liberação',
    ],
  },
  {
    id: 'em-locacao',
    nome: 'Em locação',
    cor: '#4f46e5',
    necessidades: ['aluguel'],
    campos: [
      { id: 'dataRetiradaLocacao', rotulo: 'Data da retirada', tipo: 'data' },
      { id: 'previsaoDevolucao', rotulo: 'Data prevista para devolução', tipo: 'data' },
      { id: 'observacoesLocacao', rotulo: 'Observações', tipo: 'texto-longo' },
    ],
    followUps: ['Lembrete antes do vencimento', 'Cobrança em caso de atraso'],
  },
  {
    id: 'finalizado',
    nome: 'Finalizado',
    cor: '#16a34a',
    necessidades: [],
    campos: [
      { id: 'clienteSatisfeito', rotulo: 'Cliente satisfeito', tipo: 'booleano' },
      { id: 'avaliacaoRecebida', rotulo: 'Avaliação recebida', tipo: 'booleano' },
      { id: 'fotoAutorizada', rotulo: 'Foto autorizada', tipo: 'booleano' },
    ],
    followUps: [
      'Agradecimento',
      'Pedido de avaliação',
      'Pedido de foto',
      'Lembrete dos ajustes',
      'Relacionamento futuro',
    ],
  },
  {
    id: 'perdido',
    nome: 'Perdido',
    cor: '#94a3b8',
    necessidades: [],
    campos: [
      {
        id: 'motivoPerda',
        rotulo: 'Motivo da perda',
        tipo: 'opcao',
        opcoes: [
          { id: 'preco', rotulo: 'Preço' },
          { id: 'estoque', rotulo: 'Estoque' },
          { id: 'prazo', rotulo: 'Prazo' },
          { id: 'concorrencia', rotulo: 'Concorrência' },
          { id: 'sem-retorno', rotulo: 'Sem retorno' },
        ],
      },
    ],
    followUps: ['Follow-up opcional conforme o motivo'],
  },
];

export const etapa = (id: Etapa) => FUNIL.find((e) => e.id === id)!;

export const etapasDaNecessidade = (necessidade?: Necessidade) =>
  FUNIL.filter(
    (e) => e.necessidades.length === 0 || !necessidade || e.necessidades.includes(necessidade),
  );

// Campos do checklist ainda em branco. Nao bloqueia o avanco do card, apenas
// sinaliza, conforme decidido: a atendente costuma estar com o cliente na
// frente e nem sempre da para preencher tudo na hora.
export const camposPendentes = (
  etapaId: Etapa,
  dados: Record<string, string | number | boolean | undefined>,
) => {
  const definicao = etapa(etapaId);

  return definicao.campos.filter((campo) => {
    const valor = dados[campo.id];
    return valor === undefined || valor === '' || valor === null;
  });
};
