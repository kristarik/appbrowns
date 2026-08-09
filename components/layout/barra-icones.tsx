'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { NAVEGACAO, type ItemNavegacao } from './navegacao';
import { sair } from '@/app/acoes';
import type { Sessao } from '@/lib/sessao';
import { VERSAO } from '@/lib/versao';
import { cn, iniciais } from '@/lib/utils';

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

export const BarraIcones = ({ usuario }: { usuario: Sessao }) => {
  const caminho = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

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

      <div className="relative flex flex-col items-center gap-2">
        <span className="text-[10px] font-medium text-texto-fraco">v{VERSAO}</span>
        <Item item={CONFIGURACOES} ativo={caminho.startsWith(CONFIGURACOES.href)} />

        <button
          type="button"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          title={usuario.nome}
          aria-label="Menu do usuário"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-marca text-xs font-semibold text-white"
        >
          {iniciais(usuario.nome)}
        </button>

        {menuAberto && (
          <>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuAberto(false)}
              className="fixed inset-0 z-40 cursor-default"
            />

            <div className="absolute bottom-0 left-full z-50 ml-2 w-52 rounded-xl border border-borda bg-superficie p-1 shadow-lg">
              <div className="border-b border-borda px-3 py-2">
                <p className="truncate text-[13px] font-medium text-texto">{usuario.nome}</p>
                <p className="truncate text-[11px] text-texto-fraco">{usuario.email}</p>
                <p className="mt-1 inline-block rounded bg-borda-suave px-1.5 text-[10px] font-medium text-texto-suave">
                  {usuario.papel === 'admin' ? 'Administrador' : 'Atendente'}
                </p>
              </div>

              <form action={sair}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-texto-suave transition-colors hover:bg-perigo-fraco hover:text-perigo"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
