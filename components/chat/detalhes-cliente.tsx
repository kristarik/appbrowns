'use client';

import { useTransition } from 'react';
import { AlertTriangle, Check, ListChecks, Loader2, Minus } from 'lucide-react';
import {
  CANAIS,
  NECESSIDADES,
  OCASIOES,
  ORIGENS,
  type Atendimento,
  type CampoEtapa,
  type Cliente,
  type DadosEtapa,
  type Etapa,
} from '@/lib/tipos';
import { camposPendentes, etapa as definicaoEtapa, etapasDaNecessidade } from '@/lib/funil';
import { moverAtendimento } from '@/app/acoes';
import { cn, diasAte, formatarMoeda, formatarTelefone } from '@/lib/utils';

const Linha = ({ rotulo, valor }: { rotulo: string; valor: string }) => (
  <div className="flex items-baseline justify-between gap-3 px-4 py-1.5">
    <span className="shrink-0 text-[12px] text-texto-fraco">{rotulo}</span>
    <span className="truncate text-right text-[12px] text-texto">{valor}</span>
  </div>
);

const valorDoCampo = (campo: CampoEtapa, dados: DadosEtapa) => {
  const bruto = dados[campo.id];

  if (bruto === undefined || bruto === '') return undefined;

  if (campo.tipo === 'booleano') return bruto ? 'Sim' : 'Não';
  if (campo.tipo === 'moeda') return formatarMoeda(Number(bruto));
  if (campo.tipo === 'data') return new Date(String(bruto)).toLocaleDateString('pt-BR');
  if (campo.tipo === 'data-hora')
    return new Date(String(bruto)).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  if (campo.tipo === 'opcao')
    return campo.opcoes?.find((o) => o.id === bruto)?.rotulo ?? String(bruto);

  return String(bruto);
};

type Props = {
  cliente: Cliente;
  atendimento?: Atendimento;
};

export const DetalhesCliente = ({ cliente, atendimento }: Props) => {
  const [salvando, iniciar] = useTransition();

  const mover = (destino: Etapa) => {
    if (!atendimento || destino === atendimento.etapa) return;
    iniciar(async () => void (await moverAtendimento(atendimento.id, destino)));
  };

  if (!atendimento) {
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-borda bg-superficie">
        <div className="border-b border-borda px-4 py-3">
          <p className="text-[13px] font-semibold tracking-tight text-texto">{cliente.nome}</p>
          <p className="text-[12px] text-texto-suave tabular-nums">
            {formatarTelefone(cliente.telefone)}
          </p>
        </div>
        <p className="px-4 py-6 text-center text-[12px] text-texto-fraco">
          Este cliente ainda não tem atendimento aberto
        </p>
      </aside>
    );
  }

  const definicao = definicaoEtapa(atendimento.etapa);
  const pendentes = camposPendentes(atendimento.etapa, atendimento.dados);
  const dias = atendimento.dataEvento ? diasAte(atendimento.dataEvento) : undefined;

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-borda bg-superficie">
      <div className="border-b border-borda px-4 py-3">
        <p className="text-[13px] font-semibold tracking-tight text-texto">{cliente.nome}</p>
        <p className="text-[12px] text-texto-suave tabular-nums">
          {formatarTelefone(cliente.telefone)}
        </p>
      </div>

      <div className="border-b border-borda py-2">
        <p className="px-4 pb-1 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
          Atendimento
        </p>
        <Linha rotulo="Origem do lead" valor={ORIGENS[atendimento.origem]} />
        <Linha rotulo="Canal" valor={CANAIS[atendimento.canal].nome} />
        <Linha rotulo="Interesse" valor={NECESSIDADES[atendimento.necessidade]} />
        {atendimento.ocasiao && <Linha rotulo="Ocasião" valor={OCASIOES[atendimento.ocasiao]} />}
        {atendimento.dataEvento && dias !== undefined && (
          <div className="flex items-baseline justify-between gap-3 px-4 py-1.5">
            <span className="shrink-0 text-[12px] text-texto-fraco">Data do evento</span>
            <span
              className={cn(
                'text-right text-[12px] tabular-nums',
                dias < 0
                  ? 'text-texto-suave'
                  : dias <= 7
                    ? 'font-semibold text-perigo'
                    : dias <= 21
                      ? 'font-medium text-alerta'
                      : 'text-texto',
              )}
            >
              {new Date(atendimento.dataEvento).toLocaleDateString('pt-BR')}
              {dias >= 0 && ` · ${dias}d`}
            </span>
          </div>
        )}
        {atendimento.interesseInicial && (
          <Linha rotulo="Interesse inicial" valor={atendimento.interesseInicial} />
        )}
        {atendimento.valor && <Linha rotulo="Valor" valor={formatarMoeda(atendimento.valor)} />}
        {atendimento.responsavel && (
          <Linha rotulo="Responsável" valor={atendimento.responsavel} />
        )}
      </div>

      {definicao.campos.length > 0 && (
        <div className="border-b border-borda py-2">
          <div className="flex items-center justify-between gap-2 px-4 pb-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
              <ListChecks size={12} />
              Checklist · {definicao.nome}
            </p>
            {pendentes.length > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-alerta-fraco px-1.5 py-0.5 text-[10px] font-semibold text-alerta">
                <AlertTriangle size={10} />
                {pendentes.length}
              </span>
            )}
          </div>

          <ul className="px-2">
            {definicao.campos.map((campo) => {
              const valor = valorDoCampo(campo, atendimento.dados);

              return (
                <li
                  key={campo.id}
                  className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-fundo"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full',
                      valor ? 'bg-sucesso-fraco text-sucesso' : 'bg-borda-suave text-texto-fraco',
                    )}
                  >
                    {valor ? (
                      <Check size={9} strokeWidth={3} />
                    ) : (
                      <Minus size={9} strokeWidth={3} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-texto-suave">{campo.rotulo}</p>
                    <p
                      className={cn(
                        'text-[12px]',
                        valor ? 'text-texto' : 'text-texto-fraco italic',
                      )}
                    >
                      {valor ?? 'não preenchido'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="border-b border-borda px-4 py-3">
        <p className="pb-1.5 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
          Próximos passos
        </p>
        <ul className="flex flex-col gap-1">
          {definicao.followUps.map((passo) => (
            <li key={passo} className="flex items-start gap-2 text-[12px] text-texto-suave">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-texto-fraco" />
              {passo}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3">
        <p className="flex items-center gap-1.5 pb-2 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
          Etapa
          {salvando && <Loader2 size={11} className="animate-spin" />}
        </p>

        <div className="flex flex-col gap-1">
          {etapasDaNecessidade(atendimento.necessidade).map((item) => {
            const atual = item.id === atendimento.etapa;

            return (
              <button
                key={item.id}
                type="button"
                disabled={salvando}
                onClick={() => mover(item.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors disabled:opacity-60',
                  atual
                    ? 'bg-marca-fraca font-medium text-marca'
                    : 'text-texto-suave hover:bg-borda-suave hover:text-texto',
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.cor }}
                />
                {item.nome}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
