import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const iniciais = (nome: string) =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();

export const formatarTelefone = (e164: string) => {
  const digitos = e164.replace(/\D/g, '').replace(/^55/, '');

  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }

  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  return e164;
};

export const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export const horaOuData = (iso: string) => {
  const data = new Date(iso);
  const agora = new Date('2026-08-06T12:00:00');
  const mesmoDia = data.toDateString() === agora.toDateString();

  if (mesmoDia) {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  const ontem = new Date(agora);
  ontem.setDate(ontem.getDate() - 1);

  if (data.toDateString() === ontem.toDateString()) return 'ontem';

  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

// Quantos dias faltam para o evento. Define a urgencia do card no kanban:
// uma peca sob medida para daqui a 15 dias corre mais risco que um aluguel
// para daqui a 3 meses, mesmo tendo entrado depois.
export const diasAte = (iso: string) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(iso);
  alvo.setHours(0, 0, 0, 0);

  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
};
