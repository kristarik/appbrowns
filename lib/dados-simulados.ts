import type { Atendimento, Cliente, Conversa, Mensagem, Tarefa } from './tipos';

// Dados fixos apenas para desenvolver o layout. Serao substituidos pelo banco.
// Datas relativas a uma referencia fixa para o visual nao mudar a cada dia.
const HOJE = new Date('2026-08-06T12:00:00');

const emDias = (dias: number) => {
  const d = new Date(HOJE);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
};

const haMinutos = (minutos: number) =>
  new Date(HOJE.getTime() - minutos * 60000).toISOString();

export const CLIENTES: Cliente[] = [
  { id: 'c1', nome: 'Rafael Lima', telefone: '5511987654321', email: 'rafael.lima@email.com', criadoEm: emDias(-12) },
  { id: 'c2', nome: 'Joana Vieira', telefone: '5511976543210', criadoEm: emDias(-8) },
  { id: 'c3', nome: 'Marina Costa', telefone: '5511965432109', email: 'marina@email.com', criadoEm: emDias(-30) },
  { id: 'c4', nome: 'Lucas Mendonça', telefone: '5511954321098', criadoEm: emDias(-5) },
  { id: 'c5', nome: 'Camila Andrade', telefone: '5511943210987', criadoEm: emDias(-45) },
  { id: 'c6', nome: 'Eduardo Prado', telefone: '5511932109876', criadoEm: emDias(-3) },
  { id: 'c7', nome: 'Beatriz Nogueira', telefone: '5511921098765', criadoEm: emDias(-20) },
  { id: 'c8', nome: 'Thiago Ramos', telefone: '5511910987654', criadoEm: emDias(-60) },
  { id: 'c9', nome: 'Paulo Serrano', telefone: '5511909876543', criadoEm: emDias(-38) },
  { id: 'c10', nome: 'Helena Duarte', telefone: '5511998877665', criadoEm: emDias(-52) },
];

export const ATENDIMENTOS: Atendimento[] = [
  {
    id: 'a1',
    clienteId: 'c1',
    origem: 'instagram',
    canal: 'whatsapp',
    necessidade: 'terno-sob-medida',
    ocasiao: 'casamento',
    dataEvento: emDias(21),
    interesseInicial: 'Terno slim azul marinho',
    etapa: 'novo',
    responsavel: 'Ana',
    dados: {},
    atualizadoEm: haMinutos(15),
  },
  {
    id: 'a2',
    clienteId: 'c2',
    origem: 'google-ads',
    canal: 'whatsapp',
    necessidade: 'aluguel',
    ocasiao: 'formatura',
    dataEvento: emDias(9),
    interesseInicial: 'Smoking preto',
    etapa: 'novo',
    responsavel: 'Ana',
    dados: {},
    atualizadoEm: haMinutos(48),
  },
  {
    id: 'a3',
    clienteId: 'c3',
    origem: 'indicacao',
    canal: 'instagram',
    necessidade: 'ajuste',
    ocasiao: 'corporativo',
    dataEvento: emDias(4),
    interesseInicial: 'Ajuste de barra e cintura',
    etapa: 'atendimento-inicial',
    valor: 180,
    responsavel: 'Bruno',
    dados: {},
    atualizadoEm: haMinutos(132),
  },
  {
    id: 'a4',
    clienteId: 'c4',
    origem: 'google-ads',
    canal: 'whatsapp',
    necessidade: 'aluguel',
    ocasiao: 'casamento',
    dataEvento: emDias(35),
    interesseInicial: 'Terno para padrinho',
    etapa: 'agendado',
    valor: 890,
    responsavel: 'Ana',
    dados: {
      dataVisita: emDias(2),
      consultor: 'Ana',
      presencaConfirmada: true,
      origemAgendamento: 'whatsapp',
    },
    atualizadoEm: haMinutos(200),
  },
  {
    id: 'a5',
    clienteId: 'c5',
    origem: 'site',
    canal: 'whatsapp',
    necessidade: 'terno-sob-medida',
    ocasiao: 'casamento',
    dataEvento: emDias(52),
    interesseInicial: 'Terno do noivo, tecido italiano',
    etapa: 'agendado',
    valor: 3200,
    responsavel: 'Bruno',
    // Checklist incompleto de proposito: o card mostra o aviso de pendencia.
    dados: { dataVisita: emDias(1), consultor: 'Bruno' },
    atualizadoEm: emDias(-1),
  },
  {
    id: 'a6',
    clienteId: 'c6',
    origem: 'instagram',
    canal: 'instagram',
    necessidade: 'camisa-sob-medida',
    ocasiao: 'aniversario',
    dataEvento: emDias(14),
    interesseInicial: 'Duas camisas de linho',
    etapa: 'decidindo',
    valor: 640,
    responsavel: 'Ana',
    dados: {
      dataVisitaRealizada: emDias(-2),
      produtosExperimentados: 'Linho off-white e linho azul claro',
      orcamentoApresentado: 640,
      objecaoPrincipal: 'Achou o valor alto para duas peças',
      proximoContato: emDias(1),
    },
    atualizadoEm: emDias(-1),
  },
  {
    id: 'a7',
    clienteId: 'c7',
    origem: 'passou-na-loja',
    canal: 'telefone',
    necessidade: 'terno-sob-medida',
    ocasiao: 'formatura',
    dataEvento: emDias(6),
    etapa: 'em-provas',
    valor: 2850,
    responsavel: 'Bruno',
    dados: { proximaProva: emDias(1), previsaoLiberacao: emDias(4) },
    atualizadoEm: emDias(-2),
  },
  {
    id: 'a8',
    clienteId: 'c8',
    origem: 'indicacao',
    canal: 'whatsapp',
    necessidade: 'terno-sob-medida',
    ocasiao: 'casamento',
    dataEvento: emDias(28),
    etapa: 'aguardando-retirada',
    valor: 4100,
    responsavel: 'Bruno',
    dados: { vendaConfirmada: true, dataRetirada: emDias(3), horarioRetirada: '14:00' },
    atualizadoEm: emDias(-3),
  },
  {
    id: 'a9',
    clienteId: 'c9',
    origem: 'facebook',
    canal: 'whatsapp',
    necessidade: 'aluguel',
    ocasiao: 'casamento',
    dataEvento: emDias(-2),
    etapa: 'em-locacao',
    valor: 750,
    responsavel: 'Ana',
    dados: { dataRetiradaLocacao: emDias(-4), previsaoDevolucao: emDias(1) },
    atualizadoEm: emDias(-4),
  },
  {
    id: 'a10',
    clienteId: 'c10',
    origem: 'google-ads',
    canal: 'whatsapp',
    necessidade: 'aluguel',
    ocasiao: 'formatura',
    dataEvento: emDias(-15),
    etapa: 'finalizado',
    valor: 720,
    responsavel: 'Ana',
    dados: { clienteSatisfeito: true, avaliacaoRecebida: true, fotoAutorizada: false },
    atualizadoEm: emDias(-15),
  },
  {
    id: 'a11',
    clienteId: 'c3',
    origem: 'instagram',
    canal: 'whatsapp',
    necessidade: 'aluguel',
    ocasiao: 'outro',
    dataEvento: emDias(-22),
    etapa: 'perdido',
    responsavel: 'Ana',
    motivoPerda: 'prazo',
    dados: { motivoPerda: 'prazo' },
    atualizadoEm: emDias(-22),
  },
];

export const TAREFAS: Tarefa[] = [
  { id: 't1', atendimentoId: 'a1', titulo: 'Primeiro atendimento imediato', etapaOrigem: 'novo', venceEm: haMinutos(-30), concluida: false, responsavel: 'Ana' },
  { id: 't2', atendimentoId: 'a2', titulo: 'Nova tentativa no dia seguinte', etapaOrigem: 'novo', venceEm: emDias(1), concluida: false, responsavel: 'Ana' },
  { id: 't3', atendimentoId: 'a4', titulo: 'Lembrete 24 horas antes da visita', etapaOrigem: 'agendado', venceEm: emDias(1), concluida: false, responsavel: 'Ana' },
  { id: 't4', atendimentoId: 'a5', titulo: 'Confirmação no dia da visita', etapaOrigem: 'agendado', venceEm: emDias(1), concluida: false, responsavel: 'Bruno' },
  { id: 't5', atendimentoId: 'a6', titulo: 'Novo contato alguns dias depois', etapaOrigem: 'decidindo', venceEm: emDias(1), concluida: false, responsavel: 'Ana' },
  { id: 't6', atendimentoId: 'a7', titulo: 'Confirmação de comparecimento na prova', etapaOrigem: 'em-provas', venceEm: haMinutos(120), concluida: false, responsavel: 'Bruno' },
  { id: 't7', atendimentoId: 'a8', titulo: 'Lembrete da retirada', etapaOrigem: 'aguardando-retirada', venceEm: emDias(2), concluida: false, responsavel: 'Bruno' },
  { id: 't8', atendimentoId: 'a9', titulo: 'Lembrete antes do vencimento da devolução', etapaOrigem: 'em-locacao', venceEm: haMinutos(-90), concluida: false, responsavel: 'Ana' },
  { id: 't9', atendimentoId: 'a10', titulo: 'Pedido de avaliação', etapaOrigem: 'finalizado', venceEm: emDias(-14), concluida: true, responsavel: 'Ana' },
];

export const CONVERSAS: Conversa[] = [
  { id: 'v1', clienteId: 'c1', canal: 'whatsapp', status: 'aberta', naoLidas: 2, ultimaMensagem: 'Consigo passar aí essa semana para tirar as medidas?', ultimaMensagemEm: haMinutos(15), responsavel: 'Ana' },
  { id: 'v2', clienteId: 'c2', canal: 'whatsapp', status: 'aberta', naoLidas: 1, ultimaMensagem: 'Vocês têm smoking preto no meu tamanho?', ultimaMensagemEm: haMinutos(48), responsavel: 'Ana' },
  { id: 'v3', clienteId: 'c3', canal: 'instagram', status: 'aberta', naoLidas: 3, ultimaMensagem: 'Quanto fica o ajuste da barra?', ultimaMensagemEm: haMinutos(132) },
  { id: 'v4', clienteId: 'c4', canal: 'whatsapp', status: 'aberta', naoLidas: 0, ultimaMensagem: 'Confirmado, chego às 15h', ultimaMensagemEm: haMinutos(200), responsavel: 'Bruno' },
  { id: 'v5', clienteId: 'c5', canal: 'whatsapp', status: 'aberta', naoLidas: 0, ultimaMensagem: 'Consigo remarcar para quinta?', ultimaMensagemEm: emDias(-1), responsavel: 'Bruno' },
  { id: 'v6', clienteId: 'c6', canal: 'instagram', status: 'aberta', naoLidas: 1, ultimaMensagem: 'Vocês fazem camisa de linho?', ultimaMensagemEm: emDias(-1) },
  { id: 'v7', clienteId: 'c7', canal: 'whatsapp', status: 'aberta', naoLidas: 0, ultimaMensagem: 'Confirmado para quinta então', ultimaMensagemEm: emDias(-2), responsavel: 'Bruno' },
  { id: 'v8', clienteId: 'c8', canal: 'whatsapp', status: 'resolvida', naoLidas: 0, ultimaMensagem: 'Perfeito, muito obrigado!', ultimaMensagemEm: emDias(-3), responsavel: 'Bruno' },
];

export const MENSAGENS: Mensagem[] = [
  { id: 'm1', conversaId: 'v1', direcao: 'recebida', autor: 'cliente', conteudo: 'Boa tarde! Vi o perfil de vocês no Instagram', enviadaEm: haMinutos(95) },
  { id: 'm2', conversaId: 'v1', direcao: 'enviada', autor: 'atendente', conteudo: 'Boa tarde, Rafael! Seja bem-vindo à Browns. Como posso ajudar?', enviadaEm: haMinutos(90) },
  { id: 'm3', conversaId: 'v1', direcao: 'recebida', autor: 'cliente', conteudo: 'Vou casar em novembro e queria fazer um terno sob medida. Vocês conseguem no prazo?', enviadaEm: haMinutos(84) },
  { id: 'm4', conversaId: 'v1', direcao: 'enviada', autor: 'atendente', conteudo: 'Conseguimos sim! Para sob medida trabalhamos com 45 dias, então novembro está tranquilo. Qual a data exata do casamento?', enviadaEm: haMinutos(80) },
  { id: 'm5', conversaId: 'v1', direcao: 'recebida', autor: 'cliente', conteudo: 'Dia 27 de novembro', enviadaEm: haMinutos(20) },
  { id: 'm6', conversaId: 'v1', direcao: 'recebida', autor: 'cliente', conteudo: 'Consigo passar aí essa semana para tirar as medidas?', enviadaEm: haMinutos(15) },
];

export const cliente = (id: string) => CLIENTES.find((c) => c.id === id);

export const atendimentoDoCliente = (clienteId: string) =>
  ATENDIMENTOS.filter((a) => a.clienteId === clienteId).sort(
    (a, b) => +new Date(b.atualizadoEm) - +new Date(a.atualizadoEm),
  )[0];

export const atendimento = (id: string) => ATENDIMENTOS.find((a) => a.id === id);

export const mensagensDaConversa = (conversaId: string) =>
  MENSAGENS.filter((m) => m.conversaId === conversaId);

export const conversaDoCliente = (clienteId: string) =>
  CONVERSAS.find((c) => c.clienteId === clienteId);

export const tarefasDoAtendimento = (atendimentoId: string) =>
  TAREFAS.filter((t) => t.atendimentoId === atendimentoId);

export const USUARIO = {
  nome: 'Tarik',
  email: 'contato@kristarik.com.br',
  papel: 'Administrador',
};
