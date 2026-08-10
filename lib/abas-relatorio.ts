// Modulo sem 'use client' de proposito: a pagina do servidor precisa ler estas
// listas para decidir o que renderizar. Exportar dado de um modulo de cliente
// nao funciona, porque de la o servidor so enxerga referencia de componente.

export const ABAS_COMERCIAL = [
  { id: 'geral', rotulo: 'Visão geral' },
  { id: 'funil', rotulo: 'Conversão por etapa' },
  { id: 'interesse', rotulo: 'Por interesse' },
  { id: 'perdas', rotulo: 'Motivos de perda' },
  { id: 'equipe', rotulo: 'Por atendente' },
] as const;

export const ABAS_MARKETING = [
  { id: 'origem', rotulo: 'Origem dos leads' },
  { id: 'google-ads', rotulo: 'Google Ads' },
  { id: 'site', rotulo: 'Acessos ao site' },
] as const;

export type Aba = (typeof ABAS_COMERCIAL)[number]['id'];
export type AbaMarketing = (typeof ABAS_MARKETING)[number]['id'];
