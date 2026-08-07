'use client';

import { AlertTriangle, CalendarDays, MessageCircle } from 'lucide-react';
import { CANAIS, NECESSIDADES, OCASIOES, type Atendimento } from '@/lib/tipos';
import { camposPendentes } from '@/lib/funil';
import { cliente, conversaDoCliente } from '@/lib/dados-simulados';
import { cn, diasAte, formatarMoeda, iniciais } from '@/lib/utils';

type Props = {
  atendimento: Atendimento;
  ativo: boolean;
  aoSelecionar: () => void;
};

export const Cartao = ({ atendimento, ativo, aoSelecionar }: Props) => {
  const dados = cliente(atendimento.clienteId);
  const conversa = conversaDoCliente(atendimento.clienteId);

  if (!dados) return null;

  const pendentes = camposPendentes(atendimento.etapa, atendimento.dados);
  const dias = atendimento.dataEvento ? diasAte(atendimento.dataEvento) : undefined;
  const urgente = dias !== undefined && dias >= 0 && dias <= 7;
  const proximo = dias !== undefined && dias > 7 && dias <= 21;

  return (
    <button
      type="button"
      onClick={aoSelecionar}
      className={cn(
        'w-full rounded-xl border bg-superficie p-3 text-left transition-all',
        ativo
          ? 'border-marca ring-2 ring-marca/15'
          : 'border-borda hover:border-texto-fraco/40 hover:shadow-sm',
      )}
    >
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marca-fraca text-[10px] font-semibold text-marca">
          {iniciais(dados.nome)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-texto">{dados.nome}</p>
          <p className="truncate text-[11px] text-texto-fraco">
            {NECESSIDADES[atendimento.necessidade]}
            {atendimento.ocasiao && ` · ${OCASIOES[atendimento.ocasiao]}`}
          </p>
        </div>

        {conversa && conversa.naoLidas > 0 && (
          <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-marca px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <MessageCircle size={10} />
            {conversa.naoLidas}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {dias !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
              urgente
                ? 'bg-perigo-fraco text-perigo'
                : proximo
                  ? 'bg-alerta-fraco text-alerta'
                  : 'bg-borda-suave text-texto-suave',
            )}
          >
            <CalendarDays size={11} />
            {dias < 0 ? 'realizado' : dias === 0 ? 'hoje' : `${dias} dias`}
          </span>
        )}

        {pendentes.length > 0 && (
          <span
            className="flex items-center gap-1 rounded-md bg-alerta-fraco px-1.5 py-0.5 text-[11px] font-medium text-alerta"
            title={`Faltam: ${pendentes.map((c) => c.rotulo).join(', ')}`}
          >
            <AlertTriangle size={11} />
            {pendentes.length} pendente{pendentes.length > 1 ? 's' : ''}
          </span>
        )}

        {atendimento.valor && (
          <span className="ml-auto text-[12px] font-semibold text-texto tabular-nums">
            {formatarMoeda(atendimento.valor)}
          </span>
        )}
      </div>

      {conversa && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-borda-suave pt-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: CANAIS[conversa.canal].cor }}
          />
          <p className="truncate text-[11px] text-texto-fraco">{conversa.ultimaMensagem}</p>
        </div>
      )}
    </button>
  );
};
