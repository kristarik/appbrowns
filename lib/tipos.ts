export type Necessidade =
  | 'aluguel'
  | 'terno-sob-medida'
  | 'camisa-sob-medida'
  | 'ajuste';

export type Ocasiao =
  | 'casamento'
  | 'formatura'
  | 'corporativo'
  | 'aniversario'
  | 'outro';

export type Etapa =
  | 'novo'
  | 'atendimento-inicial'
  | 'agendado'
  | 'decidindo'
  | 'aguardando-retirada'
  | 'em-provas'
  | 'em-locacao'
  | 'finalizado'
  | 'perdido';

export type Canal = 'whatsapp' | 'instagram' | 'telefone';

export type OrigemLead =
  | 'google-ads'
  | 'instagram'
  | 'facebook'
  | 'indicacao'
  | 'passou-na-loja'
  | 'site'
  | 'outro';

export type MotivoPerda =
  | 'preco'
  | 'estoque'
  | 'prazo'
  | 'concorrencia'
  | 'sem-retorno';

export type TipoCampo =
  | 'texto'
  | 'texto-longo'
  | 'data'
  | 'data-hora'
  | 'opcao'
  | 'booleano'
  | 'moeda';

export type CampoEtapa = {
  id: string;
  rotulo: string;
  tipo: TipoCampo;
  opcoes?: { id: string; rotulo: string }[];
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  observacoes?: string;
  criadoEm: string;
};

// Os campos do checklist variam por etapa, entao ficam num mapa aberto em vez
// de colunas fixas. A definicao de quais existem vive em lib/funil.ts.
export type DadosEtapa = Record<string, string | number | boolean | undefined>;

export type Atendimento = {
  id: string;
  clienteId: string;
  origem: OrigemLead;
  canal: Canal;
  necessidade: Necessidade;
  ocasiao?: Ocasiao;
  dataEvento?: string;
  interesseInicial?: string;
  etapa: Etapa;
  valor?: number;
  responsavel: string;
  motivoPerda?: MotivoPerda;
  dados: DadosEtapa;
  atualizadoEm: string;
};

export type Tarefa = {
  id: string;
  atendimentoId: string;
  titulo: string;
  etapaOrigem: Etapa;
  venceEm: string;
  concluida: boolean;
  responsavel: string;
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

export const OCASIOES: Record<Ocasiao, string> = {
  casamento: 'Casamento',
  formatura: 'Formatura',
  corporativo: 'Corporativo',
  aniversario: 'Aniversário',
  outro: 'Outro',
};

export const CANAIS: Record<Canal, { nome: string; cor: string }> = {
  whatsapp: { nome: 'WhatsApp', cor: '#25d366' },
  instagram: { nome: 'Instagram', cor: '#e1306c' },
  telefone: { nome: 'Telefone', cor: '#8b96a8' },
};

export const ORIGENS: Record<OrigemLead, string> = {
  'google-ads': 'Google Ads',
  instagram: 'Instagram',
  facebook: 'Facebook',
  indicacao: 'Indicação',
  'passou-na-loja': 'Passou na loja',
  site: 'Site',
  outro: 'Outro',
};

export const MOTIVOS_PERDA: Record<MotivoPerda, string> = {
  preco: 'Preço',
  estoque: 'Estoque',
  prazo: 'Prazo',
  concorrencia: 'Concorrência',
  'sem-retorno': 'Sem retorno',
};
