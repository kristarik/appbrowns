import {
  Bell,
  ChartColumn,
  Columns3,
  MessageCircle,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type ItemNavegacao = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  titulo: string;
  subtitulo?: string;
  secoes: { titulo?: string; itens: SubItem[] }[];
};

export type SubItem = {
  href: string;
  rotulo: string;
  icone?: LucideIcon;
  contador?: number;
  cor?: string;
};

export const NAVEGACAO: ItemNavegacao[] = [
  {
    href: '/chat',
    rotulo: 'Chat',
    icone: MessageCircle,
    titulo: 'Conversas',
    subtitulo: 'Browns Alfaiataria',
    secoes: [
      {
        itens: [
          { href: '/chat', rotulo: 'Todas as conversas', contador: 7 },
          { href: '/chat?filtro=minhas', rotulo: 'Minhas', contador: 4 },
          { href: '/chat?filtro=nao-atribuidas', rotulo: 'Não atribuídas', contador: 2 },
          { href: '/chat?filtro=resolvidas', rotulo: 'Resolvidas', contador: 1 },
        ],
      },
      {
        titulo: 'Canais',
        itens: [
          { href: '/chat?canal=whatsapp', rotulo: 'WhatsApp', cor: '#25d366', contador: 5 },
          { href: '/chat?canal=instagram', rotulo: 'Instagram', cor: '#e1306c', contador: 2 },
        ],
      },
      {
        titulo: 'Equipe',
        itens: [
          { href: '/chat?responsavel=ana', rotulo: 'Ana', contador: 4 },
          { href: '/chat?responsavel=bruno', rotulo: 'Bruno', contador: 3 },
        ],
      },
    ],
  },
  {
    href: '/kanban',
    rotulo: 'Kanban',
    icone: Columns3,
    titulo: 'Funil de atendimento',
    subtitulo: 'Browns Alfaiataria',
    secoes: [
      {
        itens: [
          { href: '/kanban', rotulo: 'Todos os atendimentos', contador: 10 },
          { href: '/kanban?filtro=meus', rotulo: 'Meus atendimentos', contador: 5 },
          { href: '/kanban?filtro=urgentes', rotulo: 'Evento próximo', contador: 3 },
        ],
      },
      {
        titulo: 'Necessidade',
        itens: [
          { href: '/kanban?necessidade=aluguel', rotulo: 'Aluguel', contador: 3 },
          { href: '/kanban?necessidade=terno-sob-medida', rotulo: 'Terno sob medida', contador: 4 },
          { href: '/kanban?necessidade=camisa-sob-medida', rotulo: 'Camisa sob medida', contador: 1 },
          { href: '/kanban?necessidade=ajuste', rotulo: 'Ajuste / conserto', contador: 2 },
        ],
      },
    ],
  },
  {
    href: '/clientes',
    rotulo: 'Clientes',
    icone: Users,
    titulo: 'Clientes',
    subtitulo: 'Browns Alfaiataria',
    secoes: [
      {
        itens: [
          { href: '/clientes', rotulo: 'Todos os clientes', contador: 8 },
          { href: '/clientes?filtro=ativos', rotulo: 'Com atendimento aberto', contador: 6 },
          { href: '/clientes?filtro=recentes', rotulo: 'Cadastrados no mês', contador: 3 },
        ],
      },
    ],
  },
  {
    href: '/relatorios',
    rotulo: 'Relatórios',
    icone: ChartColumn,
    titulo: 'Relatórios',
    subtitulo: 'Browns Alfaiataria',
    secoes: [
      {
        itens: [
          { href: '/relatorios', rotulo: 'Visão geral' },
          { href: '/relatorios?aba=funil', rotulo: 'Conversão por etapa' },
          { href: '/relatorios?aba=necessidade', rotulo: 'Por necessidade' },
          { href: '/relatorios?aba=perdas', rotulo: 'Motivos de perda' },
        ],
      },
    ],
  },
  {
    href: '/notificacoes',
    rotulo: 'Notificações',
    icone: Bell,
    titulo: 'Notificações',
    secoes: [
      {
        itens: [
          { href: '/notificacoes', rotulo: 'Todas', contador: 5 },
          { href: '/notificacoes?filtro=nao-lidas', rotulo: 'Não lidas', contador: 3 },
        ],
      },
    ],
  },
  {
    href: '/configuracoes',
    rotulo: 'Configurações',
    icone: Settings,
    titulo: 'Configurações',
    secoes: [
      {
        itens: [
          { href: '/configuracoes', rotulo: 'Geral' },
          { href: '/configuracoes/integracoes', rotulo: 'Integrações' },
          { href: '/configuracoes/equipe', rotulo: 'Equipe' },
          { href: '/configuracoes/etapas', rotulo: 'Etapas do funil' },
        ],
      },
    ],
  },
];
