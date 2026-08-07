import type { Atendimento, Cliente, Conversa, Mensagem } from './tipos';

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
  {
    id: 'c1',
    nome: 'Rafael Lima',
    telefone: '5511987654321',
    email: 'rafael.lima@email.com',
    criadoEm: emDias(-12),
  },
  {
    id: 'c2',
    nome: 'Joana Vieira',
    telefone: '5511976543210',
    criadoEm: emDias(-8),
  },
  {
    id: 'c3',
    nome: 'Marina Costa',
    telefone: '5511965432109',
    email: 'marina@email.com',
    criadoEm: emDias(-30),
  },
  {
    id: 'c4',
    nome: 'Lucas Mendonça',
    telefone: '5511954321098',
    criadoEm: emDias(-5),
  },
  {
    id: 'c5',
    nome: 'Camila Andrade',
    telefone: '5511943210987',
    criadoEm: emDias(-45),
  },
  {
    id: 'c6',
    nome: 'Eduardo Prado',
    telefone: '5511932109876',
    criadoEm: emDias(-3),
  },
  {
    id: 'c7',
    nome: 'Beatriz Nogueira',
    telefone: '5511921098765',
    criadoEm: emDias(-20),
  },
  {
    id: 'c8',
    nome: 'Thiago Ramos',
    telefone: '5511910987654',
    criadoEm: emDias(-60),
  },
];

export const ATENDIMENTOS: Atendimento[] = [
  {
    id: 'a1',
    clienteId: 'c1',
    necessidade: 'terno-sob-medida',
    dataEvento: emDias(21),
    tipoEvento: 'casamento',
    etapa: 'novo-contato',
    responsavel: 'Ana',
    atualizadoEm: haMinutos(15),
  },
  {
    id: 'a2',
    clienteId: 'c2',
    necessidade: 'aluguel',
    dataEvento: emDias(9),
    tipoEvento: 'formatura',
    etapa: 'novo-contato',
    responsavel: 'Ana',
    atualizadoEm: haMinutos(48),
  },
  {
    id: 'a3',
    clienteId: 'c3',
    necessidade: 'ajuste',
    dataEvento: emDias(4),
    tipoEvento: 'corporativo',
    etapa: 'em-atendimento',
    valor: 180,
    responsavel: 'Bruno',
    atualizadoEm: haMinutos(132),
  },
  {
    id: 'a4',
    clienteId: 'c4',
    necessidade: 'aluguel',
    dataEvento: emDias(35),
    tipoEvento: 'casamento',
    etapa: 'em-atendimento',
    valor: 890,
    responsavel: 'Ana',
    atualizadoEm: haMinutos(200),
  },
  {
    id: 'a5',
    clienteId: 'c5',
    necessidade: 'terno-sob-medida',
    dataEvento: emDias(52),
    tipoEvento: 'casamento',
    etapa: 'orcamento-enviado',
    valor: 3200,
    responsavel: 'Bruno',
    atualizadoEm: emDias(-1),
  },
  {
    id: 'a6',
    clienteId: 'c6',
    necessidade: 'camisa-sob-medida',
    dataEvento: emDias(14),
    tipoEvento: 'aniversario',
    etapa: 'orcamento-enviado',
    valor: 640,
    responsavel: 'Ana',
    atualizadoEm: emDias(-1),
  },
  {
    id: 'a7',
    clienteId: 'c7',
    necessidade: 'terno-sob-medida',
    dataEvento: emDias(6),
    tipoEvento: 'formatura',
    etapa: 'aguardando-prova',
    valor: 2850,
    responsavel: 'Bruno',
    atualizadoEm: emDias(-2),
  },
  {
    id: 'a8',
    clienteId: 'c8',
    necessidade: 'terno-sob-medida',
    dataEvento: emDias(28),
    tipoEvento: 'casamento',
    etapa: 'em-producao',
    valor: 4100,
    responsavel: 'Bruno',
    atualizadoEm: emDias(-3),
  },
  {
    id: 'a9',
    clienteId: 'c3',
    necessidade: 'aluguel',
    dataEvento: emDias(-15),
    tipoEvento: 'casamento',
    etapa: 'finalizado',
    valor: 750,
    responsavel: 'Ana',
    atualizadoEm: emDias(-15),
  },
  {
    id: 'a10',
    clienteId: 'c5',
    necessidade: 'ajuste',
    dataEvento: emDias(-22),
    tipoEvento: 'outro',
    etapa: 'perdido',
    responsavel: 'Ana',
    motivoPerda: 'Achou o prazo longo',
    atualizadoEm: emDias(-22),
  },
];

export const CONVERSAS: Conversa[] = [
  {
    id: 'v1',
    clienteId: 'c1',
    canal: 'whatsapp',
    status: 'aberta',
    naoLidas: 2,
    ultimaMensagem: 'Consigo passar aí essa semana para tirar as medidas?',
    ultimaMensagemEm: haMinutos(15),
    responsavel: 'Ana',
  },
  {
    id: 'v2',
    clienteId: 'c2',
    canal: 'whatsapp',
    status: 'aberta',
    naoLidas: 1,
    ultimaMensagem: 'Posso fazer a prova às 10h?',
    ultimaMensagemEm: haMinutos(48),
    responsavel: 'Ana',
  },
  {
    id: 'v3',
    clienteId: 'c3',
    canal: 'instagram',
    status: 'aberta',
    naoLidas: 3,
    ultimaMensagem: 'Quanto fica o ajuste da barra?',
    ultimaMensagemEm: haMinutos(132),
  },
  {
    id: 'v4',
    clienteId: 'c4',
    canal: 'whatsapp',
    status: 'aberta',
    naoLidas: 0,
    ultimaMensagem: 'Posso passar aí sábado?',
    ultimaMensagemEm: haMinutos(200),
    responsavel: 'Bruno',
  },
  {
    id: 'v5',
    clienteId: 'c5',
    canal: 'whatsapp',
    status: 'resolvida',
    naoLidas: 0,
    ultimaMensagem: 'Perfeito, muito obrigada!',
    ultimaMensagemEm: emDias(-1),
    responsavel: 'Ana',
  },
  {
    id: 'v6',
    clienteId: 'c6',
    canal: 'instagram',
    status: 'aberta',
    naoLidas: 1,
    ultimaMensagem: 'Vocês fazem camisa de linho?',
    ultimaMensagemEm: emDias(-1),
  },
  {
    id: 'v7',
    clienteId: 'c7',
    canal: 'whatsapp',
    status: 'aberta',
    naoLidas: 0,
    ultimaMensagem: 'Confirmado para quinta então',
    ultimaMensagemEm: emDias(-2),
    responsavel: 'Bruno',
  },
];

export const MENSAGENS: Mensagem[] = [
  {
    id: 'm1',
    conversaId: 'v1',
    direcao: 'recebida',
    autor: 'cliente',
    conteudo: 'Boa tarde! Vi o perfil de vocês no Instagram',
    enviadaEm: haMinutos(95),
  },
  {
    id: 'm2',
    conversaId: 'v1',
    direcao: 'enviada',
    autor: 'atendente',
    conteudo: 'Boa tarde, Rafael! Seja bem-vindo à Browns. Como posso ajudar?',
    enviadaEm: haMinutos(90),
  },
  {
    id: 'm3',
    conversaId: 'v1',
    direcao: 'recebida',
    autor: 'cliente',
    conteudo:
      'Vou casar em novembro e queria fazer um terno sob medida. Vocês conseguem no prazo?',
    enviadaEm: haMinutos(84),
  },
  {
    id: 'm4',
    conversaId: 'v1',
    direcao: 'enviada',
    autor: 'atendente',
    conteudo:
      'Conseguimos sim! Para sob medida trabalhamos com 45 dias, então novembro está tranquilo. Qual a data exata do casamento?',
    enviadaEm: haMinutos(80),
  },
  {
    id: 'm5',
    conversaId: 'v1',
    direcao: 'recebida',
    autor: 'cliente',
    conteudo: 'Dia 27 de novembro',
    enviadaEm: haMinutos(20),
  },
  {
    id: 'm6',
    conversaId: 'v1',
    direcao: 'recebida',
    autor: 'cliente',
    conteudo: 'Consigo passar aí essa semana para tirar as medidas?',
    enviadaEm: haMinutos(15),
  },
];

export const cliente = (id: string) => CLIENTES.find((c) => c.id === id);

export const atendimentoDoCliente = (clienteId: string) =>
  ATENDIMENTOS.filter((a) => a.clienteId === clienteId).sort(
    (a, b) => +new Date(b.atualizadoEm) - +new Date(a.atualizadoEm),
  )[0];

export const mensagensDaConversa = (conversaId: string) =>
  MENSAGENS.filter((m) => m.conversaId === conversaId);

export const USUARIO = {
  nome: 'Tarik',
  email: 'contato@kristarik.com.br',
  papel: 'Administrador',
};
