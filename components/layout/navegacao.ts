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
import type { Contagens } from '@/lib/consultas';
import { CANAIS, NECESSIDADES, ORIGENS, type Canal, type Necessidade, type OrigemLead } from '@/lib/tipos';

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

// Um contador zerado nao aparece, para a lateral nao virar uma parede de zeros
// numa instalacao nova.
const talvez = (total?: number) => (total ? total : undefined);

export const montarNavegacao = (c: Contagens, nomeLoja: string): ItemNavegacao[] => [
  {
    href: '/chat',
    rotulo: 'Chat',
    icone: MessageCircle,
    titulo: 'Conversas',
    subtitulo: nomeLoja,
    distintivo: talvez(c.conversas.todas - c.conversas.resolvidas),
    secoes: [
      {
        itens: [
          { href: '/chat', rotulo: 'Todas as conversas', contador: talvez(c.conversas.todas) },
          { href: '/chat?filtro=minhas', rotulo: 'Minhas', contador: talvez(c.conversas.minhas) },
          {
            href: '/chat?filtro=nao-atribuidas',
            rotulo: 'Não atribuídas',
            contador: talvez(c.conversas.naoAtribuidas),
          },
          {
            href: '/chat?filtro=resolvidas',
            rotulo: 'Resolvidas',
            contador: talvez(c.conversas.resolvidas),
          },
        ],
      },
      {
        titulo: 'Canais',
        itens: (Object.keys(CANAIS) as Canal[]).map((canal) => ({
          href: `/chat?canal=${canal}`,
          rotulo: CANAIS[canal].nome,
          cor: CANAIS[canal].cor,
          contador: talvez(c.conversas.porCanal[canal]),
        })),
      },
      ...(c.conversas.porResponsavel.length > 0
        ? [
            {
              titulo: 'Equipe',
              itens: c.conversas.porResponsavel.map((r) => ({
                href: `/chat?responsavel=${encodeURIComponent(r.nome)}`,
                rotulo: r.nome,
                contador: r.total,
              })),
            },
          ]
        : []),
    ],
  },
  {
    href: '/kanban',
    rotulo: 'Kanban',
    icone: Columns3,
    titulo: 'Funil de atendimento',
    subtitulo: nomeLoja,
    secoes: [
      {
        itens: [
          {
            href: '/kanban',
            rotulo: 'Todos os atendimentos',
            contador: talvez(c.atendimentos.todos),
          },
          {
            href: '/kanban?filtro=meus',
            rotulo: 'Meus atendimentos',
            contador: talvez(c.atendimentos.meus),
          },
          {
            href: '/kanban?filtro=urgentes',
            rotulo: 'Evento em até 7 dias',
            contador: talvez(c.atendimentos.urgentes),
            alerta: c.atendimentos.urgentes > 0,
          },
          {
            href: '/kanban?filtro=pendencias',
            rotulo: 'Checklist incompleto',
            contador: talvez(c.atendimentos.pendencias),
            alerta: c.atendimentos.pendencias > 0,
          },
        ],
      },
      {
        titulo: 'Interesse',
        itens: (Object.keys(NECESSIDADES) as Necessidade[]).map((n) => ({
          href: `/kanban?necessidade=${n}`,
          rotulo: NECESSIDADES[n],
          contador: talvez(c.atendimentos.porNecessidade[n]),
        })),
      },
      {
        titulo: 'Origem do lead',
        itens: (Object.keys(ORIGENS) as OrigemLead[])
          .filter((o) => c.atendimentos.porOrigem[o])
          .map((o) => ({
            href: `/kanban?origem=${o}`,
            rotulo: ORIGENS[o],
            contador: c.atendimentos.porOrigem[o],
          })),
      },
    ],
  },
  {
    href: '/tarefas',
    rotulo: 'Follow-ups',
    icone: ListChecks,
    titulo: 'Follow-ups',
    subtitulo: nomeLoja,
    distintivo: talvez(c.tarefas.todas),
    secoes: [
      {
        itens: [
          { href: '/tarefas', rotulo: 'Todas as pendências', contador: talvez(c.tarefas.todas) },
          {
            href: '/tarefas?filtro=atrasadas',
            rotulo: 'Atrasadas',
            contador: talvez(c.tarefas.atrasadas),
            alerta: c.tarefas.atrasadas > 0,
          },
          { href: '/tarefas?filtro=hoje', rotulo: 'Para hoje', contador: talvez(c.tarefas.hoje) },
          {
            href: '/tarefas?filtro=concluidas',
            rotulo: 'Concluídas',
            contador: talvez(c.tarefas.concluidas),
          },
        ],
      },
    ],
  },
  {
    href: '/clientes',
    rotulo: 'Clientes',
    icone: Users,
    titulo: 'Clientes',
    subtitulo: nomeLoja,
    secoes: [
      {
        itens: [
          { href: '/clientes', rotulo: 'Todos os clientes', contador: talvez(c.clientes.todos) },
          {
            href: '/clientes?filtro=ativos',
            rotulo: 'Com atendimento aberto',
            contador: talvez(c.clientes.ativos),
          },
          {
            href: '/clientes?filtro=recentes',
            rotulo: 'Cadastrados no mês',
            contador: talvez(c.clientes.recentes),
          },
        ],
      },
    ],
  },
  {
    href: '/relatorios',
    rotulo: 'Relatórios',
    icone: ChartColumn,
    titulo: 'Relatórios',
    subtitulo: nomeLoja,
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
    secoes: [{ itens: [{ href: '/notificacoes', rotulo: 'Todas' }] }],
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
