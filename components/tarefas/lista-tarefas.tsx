'use client';

import { useOptimistic, useTransition } from 'react';
import { AlertCircle, Check, Clock } from 'lucide-react';
import { etapa as definicaoEtapa } from '@/lib/funil';
import { alternarTarefa } from '@/app/acoes';
import type { Tarefa } from '@/lib/tipos';
import { cn, iniciais } from '@/lib/utils';

const quando = (iso: string) => {
  const minutos = Math.round((new Date(iso).getTime() - Date.now()) / 60000);

  if (minutos < 0) {
    const atraso = Math.abs(minutos);
    if (atraso < 60) return { texto: `atrasada ${atraso} min`, atrasada: true };
    if (atraso < 1440) return { texto: `atrasada ${Math.round(atraso / 60)}h`, atrasada: true };
    const dias = Math.round(atraso / 1440);
    return { texto: `atrasada ${dias} ${dias === 1 ? 'dia' : 'dias'}`, atrasada: true };
  }

  if (minutos < 60) return { texto: `em ${minutos} min`, atrasada: false };
  if (minutos < 1440) return { texto: `em ${Math.round(minutos / 60)}h`, atrasada: false };

  const dias = Math.round(minutos / 1440);
  return { texto: `em ${dias} ${dias === 1 ? 'dia' : 'dias'}`, atrasada: false };
};

export const ListaTarefas = ({ tarefas }: { tarefas: Tarefa[] }) => {
  const [, iniciar] = useTransition();

  const [otimistas, alternarOtimista] = useOptimistic(
    tarefas,
    (estado: Tarefa[], id: string) =>
      estado.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)),
  );

  const alternar = (id: string, concluida: boolean) =>
    iniciar(async () => {
      alternarOtimista(id);
      await alternarTarefa(id, concluida);
    });

  const pendentes = otimistas.filter((t) => !t.concluida);
  const concluidas = otimistas.filter((t) => t.concluida);
  const atrasadas = pendentes.filter((t) => new Date(t.venceEm) < new Date());

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="px-5 py-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-texto">Follow-ups</h2>
        <p className="text-[12px] text-texto-suave">
          {pendentes.length} pendentes
          {atrasadas.length > 0 && (
            <span className="font-medium text-perigo">
              {' '}
              · {atrasadas.length} atrasada{atrasadas.length > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <ul className="flex flex-col gap-2">
          {pendentes.map((tarefa) => {
            const origem = definicaoEtapa(tarefa.etapaOrigem);
            const prazo = quando(tarefa.venceEm);

            return (
              <li
                key={tarefa.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border bg-superficie px-4 py-3',
                  prazo.atrasada ? 'border-perigo/30' : 'border-borda',
                )}
              >
                <button
                  type="button"
                  onClick={() => alternar(tarefa.id, true)}
                  aria-label="Concluir tarefa"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-borda text-transparent transition-colors hover:border-sucesso hover:bg-sucesso-fraco hover:text-sucesso"
                >
                  <Check size={12} strokeWidth={3} />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-texto">{tarefa.titulo}</p>
                  <p className="flex items-center gap-1.5 truncate text-[12px] text-texto-suave">
                    <span className="flex items-center gap-1">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: origem.cor }}
                      />
                      {origem.nome}
                    </span>
                    · {tarefa.cliente}
                  </p>
                </div>

                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium',
                    prazo.atrasada
                      ? 'bg-perigo-fraco text-perigo'
                      : 'bg-borda-suave text-texto-suave',
                  )}
                >
                  {prazo.atrasada ? <AlertCircle size={11} /> : <Clock size={11} />}
                  {prazo.texto}
                </span>

                {tarefa.responsavel && (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marca-fraca text-[10px] font-semibold text-marca"
                    title={tarefa.responsavel}
                  >
                    {iniciais(tarefa.responsavel)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {pendentes.length === 0 && (
          <p className="py-10 text-center text-[13px] text-texto-fraco">
            Nenhum follow-up pendente
          </p>
        )}

        {concluidas.length > 0 && (
          <>
            <p className="px-1 pt-6 pb-2 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
              Concluídas
            </p>
            <ul className="flex flex-col gap-2">
              {concluidas.map((tarefa) => (
                <li
                  key={tarefa.id}
                  className="flex items-center gap-3 rounded-xl border border-borda bg-superficie px-4 py-3 opacity-60"
                >
                  <button
                    type="button"
                    onClick={() => alternar(tarefa.id, false)}
                    aria-label="Reabrir tarefa"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sucesso-fraco text-sucesso"
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                  <p className="truncate text-[13px] text-texto-suave line-through">
                    {tarefa.titulo}
                  </p>
                  <span className="ml-auto shrink-0 text-[12px] text-texto-fraco">
                    {tarefa.cliente}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
