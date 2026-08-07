'use client';

import { CalendarDays, Mail, Phone, Scissors, Tag, User } from 'lucide-react';
import { ETAPAS, NECESSIDADES, TIPOS_EVENTO, type Conversa } from '@/lib/tipos';
import { atendimentoDoCliente, cliente } from '@/lib/dados-simulados';
import { cn, diasAte, formatarMoeda, formatarTelefone } from '@/lib/utils';

const Campo = ({
  icone: Icone,
  rotulo,
  valor,
  destaque,
}: {
  icone: typeof User;
  rotulo: string;
  valor: string;
  destaque?: 'alerta' | 'perigo';
}) => (
  <div className="flex items-start gap-2.5 px-4 py-2">
    <Icone size={15} className="mt-0.5 shrink-0 text-texto-fraco" />
    <div className="min-w-0">
      <p className="text-[11px] text-texto-fraco">{rotulo}</p>
      <p
        className={cn(
          'text-[13px] text-texto',
          destaque === 'alerta' && 'font-medium text-alerta',
          destaque === 'perigo' && 'font-semibold text-perigo',
        )}
      >
        {valor}
      </p>
    </div>
  </div>
);

export const DetalhesCliente = ({ conversa }: { conversa: Conversa }) => {
  const dados = cliente(conversa.clienteId);
  const atendimento = dados ? atendimentoDoCliente(dados.id) : undefined;

  if (!dados) return null;

  const dias = atendimento?.dataEvento ? diasAte(atendimento.dataEvento) : undefined;

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-borda bg-superficie">
      <div className="border-b border-borda px-4 py-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-texto">
          Dados do cliente
        </h3>
      </div>

      <div className="divide-y divide-borda-suave">
        <div className="py-1">
          <Campo icone={User} rotulo="Nome" valor={dados.nome} />
          <Campo
            icone={Phone}
            rotulo="Telefone"
            valor={formatarTelefone(dados.telefone)}
          />
          {dados.email && <Campo icone={Mail} rotulo="E-mail" valor={dados.email} />}
        </div>

        {atendimento && (
          <div className="py-1">
            <div className="flex items-center justify-between px-4 pt-2 pb-1">
              <p className="text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
                Atendimento
              </p>
              {atendimento.valor && (
                <span className="text-[13px] font-semibold text-texto">
                  {formatarMoeda(atendimento.valor)}
                </span>
              )}
            </div>

            <Campo
              icone={Scissors}
              rotulo="Necessidade"
              valor={NECESSIDADES[atendimento.necessidade]}
            />

            {atendimento.tipoEvento && (
              <Campo
                icone={Tag}
                rotulo="Tipo de evento"
                valor={TIPOS_EVENTO[atendimento.tipoEvento]}
              />
            )}

            {atendimento.dataEvento && dias !== undefined && (
              <Campo
                icone={CalendarDays}
                rotulo="Data do evento"
                valor={
                  dias < 0
                    ? `${new Date(atendimento.dataEvento).toLocaleDateString('pt-BR')} (passado)`
                    : `${new Date(atendimento.dataEvento).toLocaleDateString('pt-BR')} · faltam ${dias} dias`
                }
                destaque={dias < 0 ? undefined : dias <= 7 ? 'perigo' : dias <= 21 ? 'alerta' : undefined}
              />
            )}
          </div>
        )}
      </div>

      {atendimento && (
        <div className="border-t border-borda px-4 py-3">
          <p className="pb-2 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
            Etapa no funil
          </p>

          <div className="flex flex-col gap-1">
            {ETAPAS.map((etapa) => {
              const atual = etapa.id === atendimento.etapa;

              return (
                <button
                  key={etapa.id}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors',
                    atual
                      ? 'bg-marca-fraca font-medium text-marca'
                      : 'text-texto-suave hover:bg-borda-suave hover:text-texto',
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: etapa.cor }}
                  />
                  {etapa.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
