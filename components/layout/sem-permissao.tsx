import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { PAPEIS } from '@/lib/permissoes';
import type { Papel } from '@/lib/tipos';

export const SemPermissao = ({ papel, precisa }: { papel: Papel; precisa: string }) => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="w-full max-w-sm rounded-2xl border border-borda bg-superficie p-6 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-alerta-fraco text-alerta">
        <ShieldAlert size={20} />
      </span>

      <h2 className="mt-3 text-[15px] font-semibold tracking-tight text-texto">
        Esta área não é do seu acesso
      </h2>
      <p className="mt-1 text-[13px] text-texto-suave">
        Você entrou como <strong className="font-medium">{PAPEIS[papel].nome}</strong>. Esta
        parte é {precisa}.
      </p>

      <Link
        href="/chat"
        className="mt-4 inline-block rounded-lg bg-marca px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-marca-escura"
      >
        Voltar para as conversas
      </Link>
    </div>
  </div>
);
