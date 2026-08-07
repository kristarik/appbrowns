import {
  Bell,
  ChartColumn,
  Columns3,
  ListChecks,
  MessageCircle,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type SubItem = {
  href: string;
  rotulo: string;
  contador?: number;
  cor?: string;
  alerta?: boolean;
};

export type ItemNavegacao = {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  titulo: string;
  subtitulo?: string;
  distintivo?: number;
  secoes: { titulo?: string; itens: SubItem[] }[];
};

export const NAVEGACAO: ItemNavegacao[] = [
  {
    href: '/chat',
    rotulo: 'Chat',
    icone: MessageCircle,
    titulo: 'Conversas',
    subtitulo: 'Browns Alfaiataria',
    distintivo: 7,
    secoes: [
      {
        itens: [
          { href: '/chat', rotulo: 'Todas as conversas', contador: 8 },
          { href: '/chat?filtro=minhas', rotulo: 'Minhas', contador: 6 },
          { href: '/chat?filtro=nao-atribuidas', rotulo: 'Não atribuídas', contador: 2 },
          { href: '/chat?filtro=resolvidas', rotulo: 'Resolvidas', contador: 1 },
        ],
      },
      {
        titulo: 'Canais',
        itens: [
          { href: '/chat?canal=whatsapp', rotulo: 'WhatsApp', cor: '#25d366', contador: 6 },
          { href: '/chat?canal=instagram', rotulo: 'Instagram', cor: '#e1306c', contador: 2 },
          { href: '/chat?canal=telefone', rotulo: 'Telefone', cor: '#8b96a8' },
        ],
      },
      {
        titulo: 'Equipe',
        itens: [
          { href: '/chat?responsavel=ana', rotulo: 'Ana', contador: 3 },
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
          { href: '/kanban', rotulo: 'Todos os atendimentos', contador: 11 },
          { href: '/kanban?filtro=meus', rotulo: 'Meus atendimentos', contador: 6 },
          { href: '/kanban?filtro=urgentes', rotulo: 'Evento em até 7 dias', contador: 3 },
          { href: '/kanban?filtro=pendencias', rotulo: 'Checklist incompleto', contador: 4, alerta: true },
        ],
      },
      {
        titulo: 'Interesse',
        itens: [
          { href: '/kanban?necessidade=aluguel', rotulo: 'Aluguel', contador: 5 },
          { href: '/kanban?necessidade=terno-sob-medida', rotulo: 'Terno sob medida', contador: 4 },
          { href: '/kanban?necessidade=camisa-sob-medida', rotulo: 'Camisa sob medida', contador: 1 },
          { href: '/kanban?necessidade=ajuste', rotulo: 'Ajuste / conserto', contador: 1 },
        ],
      },
      {
        titulo: 'Origem do lead',
        itens: [
          { href: '/kanban?origem=google-ads', rotulo: 'Google Ads', contador: 3 },
          { href: '/kanban?origem=instagram', rotulo: 'Instagram', contador: 3 },
          { href: '/kanban?origem=indicacao', rotulo: 'Indicação', contador: 2 },
          { href: '/kanban?origem=site', rotulo: 'Site', contador: 1 },
        ],
      },
    ],
  },
  {
    href: '/tarefas',
    rotulo: 'Follow-ups',
    icone: ListChecks,
    titulo: 'Follow-ups',
    subtitulo: 'Browns Alfaiataria',
    distintivo: 8,
    secoes: [
      {
        itens: [
          { href: '/tarefas', rotulo: 'Todas as pendências', contador: 8 },
          { href: '/tarefas?filtro=atrasadas', rotulo: 'Atrasadas', contador: 2, alerta: true },
          { href: '/tarefas?filtro=hoje', rotulo: 'Para hoje', contador: 1 },
          { href: '/tarefas?filtro=concluidas', rotulo: 'Concluídas', contador: 1 },
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
          { href: '/clientes', rotulo: 'Todos os clientes', contador: 10 },
          { href: '/clientes?filtro=ativos', rotulo: 'Com atendimento aberto', contador: 8 },
          { href: '/clientes?filtro=recentes', rotulo: 'Cadastrados no mês', contador: 4 },
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
        titulo: 'Comercial',
        itens: [
          { href: '/relatorios', rotulo: 'Visão geral' },
          { href: '/relatorios?aba=funil', rotulo: 'Conversão por etapa' },
          { href: '/relatorios?aba=interesse', rotulo: 'Por interesse' },
          { href: '/relatorios?aba=perdas', rotulo: 'Motivos de perda' },
          { href: '/relatorios?aba=equipe', rotulo: 'Por atendente' },
        ],
      },
      {
        titulo: 'Marketing',
        itens: [
          { href: '/relatorios?aba=origem', rotulo: 'Origem dos leads' },
          { href: '/relatorios?aba=google-ads', rotulo: 'Google Ads' },
          { href: '/relatorios?aba=site', rotulo: 'Acessos ao site' },
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
