// Os valores destes tipos sao identicos aos enums do Prisma (snake_case), para
// que o dado do banco chegue na tela sem camada de traducao no meio. Sao unioes
// de string em vez de import do @prisma/client porque estes tipos rodam tambem
// em componentes de cliente, e o client do Prisma nao pode ir para o navegador.

export type Necessidade =
  | 'aluguel'
  | 'terno_sob_medida'
  | 'camisa_sob_medida'
  | 'ajuste';

export type Ocasiao =
  | 'casamento'
  | 'formatura'
  | 'corporativo'
  | 'aniversario'
  | 'outro';

export type Etapa =
  | 'novo'
  | 'atendimento_inicial'
  | 'agendado'
  | 'decidindo'
  | 'aguardando_retirada'
  | 'em_provas'
  | 'em_locacao'
  | 'finalizado'
  | 'perdido';

export type Canal = 'whatsapp' | 'instagram' | 'telefone';

export type OrigemLead =
  | 'google_ads'
  | 'instagram'
  | 'facebook'
  | 'indicacao'
  | 'passou_na_loja'
  | 'site'
  | 'outro';

export type MotivoPerda =
  | 'preco'
  | 'estoque'
  | 'prazo'
  | 'concorrencia'
  | 'sem_retorno';

export type Papel = 'admin' | 'gerente' | 'atendente';

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

export type DadosEtapa = Record<string, string | number | boolean | undefined>;

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
  origem: OrigemLead;
  canal: Canal;
  necessidade: Necessidade;
  ocasiao?: Ocasiao;
  dataEvento?: string;
  interesseInicial?: string;
  etapa: Etapa;
  valor?: number;
  responsavel?: string;
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
  responsavel?: string;
  cliente: string;
};

export type Mensagem = {
  id: string;
  conversaId: string;
  direcao: 'recebida' | 'enviada';
  autor: 'cliente' | 'atendente' | 'sistema';
  conteudo: string;
  enviadaPor?: string;
  enviadaEm: string;
};

export type Conversa = {
  id: string;
  clienteId: string;
  clienteNome: string;
  canal: Canal;
  status: 'aberta' | 'resolvida';
  naoLidas: number;
  ultimaMensagem?: string;
  ultimaMensagemEm?: string;
  responsavel?: string;
};

// O cartao do kanban precisa de dados de tres tabelas ao mesmo tempo. Juntar
// no servidor evita que o componente tenha que buscar nome e conversa por conta.
export type ItemQuadro = {
  atendimento: Atendimento;
  clienteNome: string;
  conversa?: Conversa;
};

export const NECESSIDADES: Record<Necessidade, string> = {
  aluguel: 'Aluguel',
  terno_sob_medida: 'Terno sob medida',
  camisa_sob_medida: 'Camisa sob medida',
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
  google_ads: 'Google Ads',
  instagram: 'Instagram',
  facebook: 'Facebook',
  indicacao: 'Indicação',
  passou_na_loja: 'Passou na loja',
  site: 'Site',
  outro: 'Outro',
};

export const MOTIVOS_PERDA: Record<MotivoPerda, string> = {
  preco: 'Preço',
  estoque: 'Estoque',
  prazo: 'Prazo',
  concorrencia: 'Concorrência',
  sem_retorno: 'Sem retorno',
};
