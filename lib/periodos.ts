// Fica separado de lib/relatorios.ts porque as telas de cliente precisam da
// lista de periodos, e aquele modulo puxa o banco junto.
export type Periodo = '30' | '90' | '365' | 'tudo';

export const PERIODOS: { id: Periodo; rotulo: string }[] = [
  { id: '30', rotulo: '30 dias' },
  { id: '90', rotulo: '90 dias' },
  { id: '365', rotulo: '12 meses' },
  { id: 'tudo', rotulo: 'Tudo' },
];
