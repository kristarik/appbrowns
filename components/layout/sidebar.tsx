'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import type { ItemNavegacao } from './navegacao';
import { cn } from '@/lib/utils';

type Props = {
  navegacao: ItemNavegacao[];
  recolhida: boolean;
  aoAlternar: () => void;
};

export const Sidebar = ({ navegacao, recolhida, aoAlternar }: Props) => {
  const caminho = usePathname();
  const parametros = useSearchParams();
  const secao = navegacao.find((i) => caminho.startsWith(i.href)) ?? navegacao[0];

  // O item ativo depende tambem da query, porque /chat e /chat?filtro=minhas
  // sao entradas diferentes apontando para o mesmo caminho.
  const atual = parametros.toString() ? `${caminho}?${parametros}` : caminho;

  if (recolhida) {
    return (
      <aside className="flex w-12 shrink-0 flex-col items-center border-r border-borda bg-superficie py-3">
        <button
          type="button"
          onClick={aoAlternar}
          title="Expandir menu"
          aria-label="Expandir menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-texto-fraco transition-colors hover:bg-borda-suave hover:text-texto"
        >
          <PanelLeftOpen size={17} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-68 shrink-0 flex-col border-r border-borda bg-superficie">
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-texto">
            {secao.titulo}
          </h1>
          {secao.subtitulo && (
            <button
              type="button"
              className="mt-1 flex items-center gap-1 text-xs text-texto-suave transition-colors hover:text-texto"
            >
              <span className="truncate">{secao.subtitulo}</span>
              <ChevronDown size={13} className="shrink-0" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={aoAlternar}
          title="Recolher menu"
          aria-label="Recolher menu"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-texto-fraco transition-colors hover:bg-borda-suave hover:text-texto"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-lg border border-borda bg-fundo px-2.5 py-1.5">
          <Search size={14} className="shrink-0 text-texto-fraco" />
          <input
            type="search"
            placeholder="Buscar"
            className="w-full bg-transparent text-[13px] text-texto outline-none placeholder:text-texto-fraco"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {secao.secoes.map((grupo, indice) => {
          if (grupo.itens.length === 0) return null;

          return (
            <div key={grupo.titulo ?? indice} className={cn(indice > 0 && 'mt-5')}>
              {grupo.titulo && (
                <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
                  {grupo.titulo}
                </p>
              )}

              <ul className="flex flex-col gap-0.5">
                {grupo.itens.map((item) => {
                  const ativo = atual === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors',
                          ativo
                            ? 'bg-marca-fraca font-medium text-marca'
                            : 'text-texto-suave hover:bg-borda-suave hover:text-texto',
                        )}
                      >
                        {item.cor && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: item.cor }}
                          />
                        )}
                        <span className="flex-1 truncate">{item.rotulo}</span>
                        {item.contador !== undefined && (
                          <span
                            className={cn(
                              'shrink-0 text-[11px] font-medium tabular-nums',
                              item.alerta
                                ? 'rounded bg-alerta-fraco px-1 text-alerta'
                                : ativo
                                  ? 'text-marca'
                                  : 'text-texto-fraco',
                            )}
                          >
                            {item.contador}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
