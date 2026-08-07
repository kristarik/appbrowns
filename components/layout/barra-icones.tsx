'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVEGACAO, type ItemNavegacao } from './navegacao';
import { cn, iniciais } from '@/lib/utils';
import { USUARIO } from '@/lib/dados-simulados';
import { VERSAO } from '@/lib/versao';

const PRINCIPAIS = NAVEGACAO.filter((i) => i.href !== '/configuracoes');
const CONFIGURACOES = NAVEGACAO.find((i) => i.href === '/configuracoes')!;

const Item = ({ item, ativo }: { item: ItemNavegacao; ativo: boolean }) => {
  const Icone = item.icone;

  return (
    <Link
      href={item.href}
      title={item.rotulo}
      aria-label={item.rotulo}
      aria-current={ativo ? 'page' : undefined}
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
        ativo
          ? 'bg-marca-fraca text-marca'
          : 'text-texto-fraco hover:bg-borda-suave hover:text-texto-suave',
      )}
    >
      <Icone size={20} strokeWidth={ativo ? 2.2 : 1.8} />

      {item.distintivo !== undefined && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-marca px-1 text-[9px] font-semibold text-white tabular-nums">
          {item.distintivo}
        </span>
      )}

      <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-texto px-2 py-1 text-xs font-medium text-white group-hover:block">
        {item.rotulo}
      </span>
    </Link>
  );
};

export const BarraIcones = () => {
  const caminho = usePathname();

  return (
    <nav className="flex w-16 shrink-0 flex-col items-center border-r border-borda bg-superficie py-3">
      <Link
        href="/chat"
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-texto text-sm font-semibold tracking-tight text-white"
        title="Browns Alfaiataria"
      >
        B
      </Link>

      <div className="flex flex-1 flex-col items-center gap-1">
        {PRINCIPAIS.map((item) => (
          <Item key={item.href} item={item} ativo={caminho.startsWith(item.href)} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-medium text-texto-fraco">v{VERSAO}</span>
        <Item item={CONFIGURACOES} ativo={caminho.startsWith(CONFIGURACOES.href)} />
        <button
          type="button"
          title={USUARIO.nome}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-marca text-xs font-semibold text-white"
        >
          {iniciais(USUARIO.nome)}
        </button>
      </div>
    </nav>
  );
};
