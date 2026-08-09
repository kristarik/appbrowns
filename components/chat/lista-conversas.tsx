'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CANAIS, type Conversa } from '@/lib/tipos';
import { cn, horaOuData, iniciais } from '@/lib/utils';

const CORES_AVATAR = ['#1b6df0', '#c026d3', '#ea8c00', '#0891b2', '#16a34a', '#dc2626'];

const corDoAvatar = (id: string) =>
  CORES_AVATAR[id.charCodeAt(id.length - 1) % CORES_AVATAR.length];

type Aba = 'minhas' | 'nao_atribuidas' | 'todas';

type Props = {
  conversas: Conversa[];
  selecionada: string;
  aoSelecionar: (id: string) => void;
};

export const ListaConversas = ({ conversas, selecionada, aoSelecionar }: Props) => {
  const [aba, setAba] = useState<Aba>('todas');
  const [busca, setBusca] = useState('');

  const abas: { id: Aba; rotulo: string; total: number }[] = [
    { id: 'minhas', rotulo: 'Minhas', total: conversas.filter((c) => c.responsavel).length },
    {
      id: 'nao_atribuidas',
      rotulo: 'Não atribuídas',
      total: conversas.filter((c) => !c.responsavel).length,
    },
    { id: 'todas', rotulo: 'Todas', total: conversas.length },
  ];

  const filtradas = conversas
    .filter((c) =>
      aba === 'minhas' ? Boolean(c.responsavel) : aba === 'nao_atribuidas' ? !c.responsavel : true,
    )
    .filter((c) => c.clienteNome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <section className="flex w-96 shrink-0 flex-col border-r border-borda bg-superficie">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 rounded-lg border border-borda bg-fundo px-2.5 py-2">
          <Search size={15} className="shrink-0 text-texto-fraco" />
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar nas conversas"
            className="w-full bg-transparent text-[13px] text-texto outline-none placeholder:text-texto-fraco"
          />
        </div>
      </div>

      <div className="flex items-baseline gap-2 px-4 pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-texto">Conversas</h2>
        <span className="rounded-md bg-borda-suave px-1.5 py-0.5 text-[11px] font-medium text-texto-suave">
          {filtradas.length}
        </span>
      </div>

      <div className="flex gap-4 border-b border-borda px-4">
        {abas.map((item) => {
          const ativa = aba === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setAba(item.id)}
              className={cn(
                'relative -mb-px flex items-center gap-1.5 pb-2 text-[13px] transition-colors',
                ativa ? 'font-medium text-marca' : 'text-texto-suave hover:text-texto',
              )}
            >
              {item.rotulo}
              <span
                className={cn(
                  'rounded px-1 text-[11px] font-medium tabular-nums',
                  ativa ? 'bg-marca-fraca text-marca' : 'bg-borda-suave text-texto-fraco',
                )}
              >
                {item.total}
              </span>
              {ativa && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-marca" />
              )}
            </button>
          );
        })}
      </div>

      <ul className="flex-1 overflow-y-auto">
        {filtradas.map((conversa) => {
          const ativo = conversa.id === selecionada;
          const canal = CANAIS[conversa.canal];

          return (
            <li key={conversa.id}>
              <button
                type="button"
                onClick={() => aoSelecionar(conversa.id)}
                className={cn(
                  'relative flex w-full gap-3 border-b border-borda-suave px-4 py-3 text-left transition-colors',
                  ativo ? 'bg-marca-fraca/60' : 'hover:bg-fundo',
                )}
              >
                {ativo && <span className="absolute inset-y-0 left-0 w-0.5 bg-marca" />}

                <div className="relative shrink-0">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: corDoAvatar(conversa.clienteId) }}
                  >
                    {iniciais(conversa.clienteNome)}
                  </span>
                  <span
                    className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-superficie"
                    style={{ backgroundColor: canal.cor }}
                    title={canal.nome}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] font-medium text-texto">
                      {conversa.clienteNome}
                    </p>
                    {conversa.ultimaMensagemEm && (
                      <span className="shrink-0 text-[11px] text-texto-fraco">
                        {horaOuData(conversa.ultimaMensagemEm)}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[11px] text-texto-fraco uppercase">
                    {canal.nome} · Browns
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] text-texto-suave">
                      {conversa.ultimaMensagem ?? 'Sem mensagens'}
                    </p>

                    {conversa.naoLidas > 0 ? (
                      <span className="flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-marca px-1 text-[10px] font-semibold text-white tabular-nums">
                        {conversa.naoLidas}
                      </span>
                    ) : conversa.status === 'resolvida' ? (
                      <span className="shrink-0 text-[11px] font-medium text-sucesso">
                        Resolvida
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}

        {filtradas.length === 0 && (
          <li className="px-4 py-8 text-center text-[13px] text-texto-fraco">
            Nenhuma conversa encontrada
          </li>
        )}
      </ul>
    </section>
  );
};
