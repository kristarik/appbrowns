export type Necessidade =
  | 'aluguel'
  | 'terno-sob-medida'
  | 'camisa-sob-medida'
  | 'ajuste';

export type TipoEvento =
  | 'casamento'
  | 'formatura'
  | 'corporativo'
  | 'aniversario'
  | 'outro';

export type Etapa =
  | 'novo-contato'
  | 'em-atendimento'
  | 'orcamento-enviado'
  | 'aguardando-prova'
  | 'em-producao'
  | 'finalizado'
  | 'perdido';

export type Canal = 'whatsapp' | 'instagram' | 'manual';

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  observacoes?: string;
  criadoEm: string;
};

export type Atendimento = {
  id: string;
  clienteId: string;
  necessidade: Necessidade;
  dataEvento?: string;
  tipoEvento?: TipoEvento;
  etapa: Etapa;
  valor?: number;
  responsavel: string;
  motivoPerda?: string;
  atualizadoEm: string;
};

export type Mensagem = {
  id: string;
  conversaId: string;
  direcao: 'recebida' | 'enviada';
  autor: 'cliente' | 'atendente' | 'sistema';
  conteudo: string;
  enviadaEm: string;
};

export type Conversa = {
  id: string;
  clienteId: string;
  canal: Canal;
  status: 'aberta' | 'resolvida';
  naoLidas: number;
  ultimaMensagem: string;
  ultimaMensagemEm: string;
  responsavel?: string;
};

export const NECESSIDADES: Record<Necessidade, string> = {
  aluguel: 'Aluguel',
  'terno-sob-medida': 'Terno sob medida',
  'camisa-sob-medida': 'Camisa sob medida',
  ajuste: 'Ajuste / conserto',
};

export const TIPOS_EVENTO: Record<TipoEvento, string> = {
  casamento: 'Casamento',
  formatura: 'Formatura',
  corporativo: 'Corporativo',
  aniversario: 'Aniversário',
  outro: 'Outro',
};

export const ETAPAS: { id: Etapa; nome: string; cor: string }[] = [
  { id: 'novo-contato', nome: 'Novo contato', cor: '#1b6df0' },
  { id: 'em-atendimento', nome: 'Em atendimento', cor: '#7c3aed' },
  { id: 'orcamento-enviado', nome: 'Orçamento enviado', cor: '#ea8c00' },
  { id: 'aguardando-prova', nome: 'Aguardando prova', cor: '#0891b2' },
  { id: 'em-producao', nome: 'Em produção', cor: '#c026d3' },
  { id: 'finalizado', nome: 'Finalizado', cor: '#16a34a' },
  { id: 'perdido', nome: 'Perdido', cor: '#94a3b8' },
];

export const CANAIS: Record<Canal, { nome: string; cor: string }> = {
  whatsapp: { nome: 'WhatsApp', cor: '#25d366' },
  instagram: { nome: 'Instagram', cor: '#e1306c' },
  manual: { nome: 'Manual', cor: '#8b96a8' },
};
