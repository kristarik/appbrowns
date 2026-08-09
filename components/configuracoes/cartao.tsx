import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Resultado } from '@/app/configuracoes-acoes';

export const Cartao = ({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-borda bg-superficie">
    <header className="border-b border-borda px-5 py-3.5">
      <h3 className="text-[14px] font-semibold tracking-tight text-texto">{titulo}</h3>
      {descricao && <p className="mt-0.5 text-[12px] text-texto-suave">{descricao}</p>}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

export const Aviso = ({ estado }: { estado: Resultado }) => {
  if (!estado.erro && !estado.ok) return null;

  const erro = Boolean(estado.erro);

  return (
    <p
      className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-[12px] ${
        erro ? 'bg-perigo-fraco text-perigo' : 'bg-sucesso-fraco text-sucesso'
      }`}
    >
      {erro ? (
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
      )}
      {estado.erro ?? estado.ok}
    </p>
  );
};

export const Campo = ({
  rotulo,
  ajuda,
  children,
}: {
  rotulo: string;
  ajuda?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="text-[13px] font-medium text-texto">{rotulo}</span>
    {ajuda && <span className="block text-[11px] text-texto-fraco">{ajuda}</span>}
    <div className="mt-1.5">{children}</div>
  </label>
);

export const entrada =
  'w-full rounded-lg border border-borda bg-fundo px-3 py-2 text-[13px] text-texto outline-none transition-colors placeholder:text-texto-fraco focus:border-marca';

export const botao =
  'flex items-center justify-center gap-2 rounded-lg bg-marca px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-marca-escura disabled:opacity-60';
