'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { NECESSIDADES, OCASIOES, ORIGENS, type Atendimento, type Cliente } from '@/lib/tipos';
import { etapa as definicaoEtapa } from '@/lib/funil';
import { cn, diasAte, formatarData, formatarTelefone, iniciais } from '@/lib/utils';

const COLUNAS = [
  'Cliente',
  'Telefone',
  'Origem',
  'Interesse',
  'Ocasião',
  'Data do evento',
  'Etapa',
];

type Props = {
  clientes: Cliente[];
  atendimentos: Atendimento[];
};

export const TabelaClientes = ({ clientes, atendimentos }: Props) => {
  const [busca, setBusca] = useState('');

  // listarAtendimentos ja vem ordenado do mais recente para o mais antigo,
  // entao o primeiro encontrado de cada cliente e o atendimento atual dele.
  const atual = new Map<string, Atendimento>();
  for (const atendimento of atendimentos) {
    if (!atual.has(atendimento.clienteId)) atual.set(atendimento.clienteId, atendimento);
  }

  const filtrados = clientes.filter((c) =>
    (c.nome + c.telefone).toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 px-5 py-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-texto">Clientes</h2>
          <p className="text-[12px] text-texto-suave">{filtrados.length} cadastrados</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex w-64 items-center gap-2 rounded-lg border border-borda bg-superficie px-2.5 py-1.5">
            <Search size={14} className="shrink-0 text-texto-fraco" />
            <input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar por nome ou telefone"
              className="w-full bg-transparent text-[13px] text-texto outline-none placeholder:text-texto-fraco"
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-marca-escura"
          >
            <Plus size={14} />
            Novo cliente
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-5 pb-5">
        <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-borda bg-superficie">
          <thead>
            <tr className="bg-fundo">
              {COLUNAS.map((coluna) => (
                <th
                  key={coluna}
                  className="border-b border-borda px-4 py-2.5 text-left text-[11px] font-semibold tracking-wide text-texto-fraco uppercase"
                >
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtrados.map((cliente) => {
              const atendimento = atual.get(cliente.id);
              const etapa = atendimento ? definicaoEtapa(atendimento.etapa) : undefined;
              const dias = atendimento?.dataEvento
                ? diasAte(atendimento.dataEvento)
                : undefined;

              return (
                <tr key={cliente.id} className="transition-colors hover:bg-fundo">
                  <td className="border-b border-borda-suave px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marca-fraca text-[10px] font-semibold text-marca">
                        {iniciais(cliente.nome)}
                      </span>
                      <span className="text-[13px] font-medium text-texto">{cliente.nome}</span>
                    </div>
                  </td>

                  <td className="border-b border-borda-suave px-4 py-2.5 text-[13px] text-texto-suave tabular-nums">
                    {formatarTelefone(cliente.telefone)}
                  </td>

                  <td className="border-b border-borda-suave px-4 py-2.5 text-[13px] text-texto-suave">
                    {atendimento ? ORIGENS[atendimento.origem] : '—'}
                  </td>

                  <td className="border-b border-borda-suave px-4 py-2.5 text-[13px] text-texto-suave">
                    {atendimento?.necessidade ? NECESSIDADES[atendimento.necessidade] : '—'}
                  </td>

                  <td className="border-b border-borda-suave px-4 py-2.5 text-[13px] text-texto-suave">
                    {atendimento?.ocasiao ? OCASIOES[atendimento.ocasiao] : '—'}
                  </td>

                  <td className="border-b border-borda-suave px-4 py-2.5 text-[13px]">
                    {atendimento?.dataEvento && dias !== undefined ? (
                      <span
                        className={cn(
                          'tabular-nums',
                          dias >= 0 && dias <= 7
                            ? 'font-medium text-perigo'
                            : dias > 7 && dias <= 21
                              ? 'text-alerta'
                              : 'text-texto-suave',
                        )}
                      >
                        {formatarData(atendimento.dataEvento)}
                      </span>
                    ) : (
                      <span className="text-texto-fraco">—</span>
                    )}
                  </td>

                  <td className="border-b border-borda-suave px-4 py-2.5">
                    {etapa ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-borda-suave px-2 py-0.5 text-[12px] text-texto-suave">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: etapa.cor }}
                        />
                        {etapa.nome}
                      </span>
                    ) : (
                      <span className="text-[13px] text-texto-fraco">—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {filtrados.length === 0 && (
              <tr>
                <td
                  colSpan={COLUNAS.length}
                  className="px-4 py-8 text-center text-[13px] text-texto-fraco"
                >
                  Nenhum cliente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
