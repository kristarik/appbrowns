import Link from 'next/link';
import { Barras, Bloco, Colunas, Funil, Indicador, Vazio } from './pecas';
import { ABAS_COMERCIAL as ABAS, type Aba } from '@/lib/abas-relatorio';
import { PERIODOS, type Periodo } from '@/lib/periodos';
import type { RelatorioComercial } from '@/lib/relatorios';
import { cn, formatarMoeda } from '@/lib/utils';

const endereco = (aba: Aba, periodo: Periodo) =>
  `/relatorios?aba=${aba}${periodo === '90' ? '' : `&periodo=${periodo}`}`;

export const TelaRelatorios = ({
  dados,
  aba,
}: {
  dados: RelatorioComercial;
  aba: Aba;
}) => {
  const { totais, periodo } = dados;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-texto">
            Relatório comercial
          </h2>
          <p className="text-[12px] text-texto-suave">
            {totais.atendimentos} atendimentos no período
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1">
          {PERIODOS.map((item) => (
            <Link
              key={item.id}
              href={endereco(aba, item.id)}
              className={cn(
                'rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                periodo === item.id
                  ? 'bg-marca-fraca font-medium text-marca'
                  : 'text-texto-suave hover:bg-borda-suave hover:text-texto',
              )}
            >
              {item.rotulo}
            </Link>
          ))}
        </div>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-borda">
        {ABAS.map((item) => (
          <Link
            key={item.id}
            href={endereco(item.id, periodo)}
            className={cn(
              'relative -mb-px px-3 py-2 text-[13px] transition-colors',
              aba === item.id
                ? 'font-medium text-marca'
                : 'text-texto-suave hover:text-texto',
            )}
          >
            {item.rotulo}
            {aba === item.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-marca" />
            )}
          </Link>
        ))}
      </nav>

      {dados.semDados ? (
        <div className="rounded-2xl border border-borda bg-superficie px-5 py-10 text-center">
          <p className="text-[13px] text-texto-suave">
            Nenhum atendimento cadastrado neste período.
          </p>
          <p className="mt-1 text-[12px] text-texto-fraco">
            Os números aparecem conforme a equipe usar o funil.
          </p>
        </div>
      ) : (
        <>
          {aba === 'geral' && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Indicador
                  rotulo="Em negociação"
                  valor={formatarMoeda(totais.valorEmAberto)}
                  apoio={`${totais.emAberto} atendimentos abertos`}
                  destaque
                />
                <Indicador
                  rotulo="Faturamento"
                  valor={formatarMoeda(totais.faturamento)}
                  apoio={`${totais.ganhos} finalizados`}
                />
                <Indicador
                  rotulo="Ticket médio"
                  valor={formatarMoeda(totais.ticketMedio)}
                  apoio="Média dos finalizados"
                />
                <Indicador
                  rotulo="Conversão"
                  valor={`${totais.conversao.toFixed(0)}%`}
                  apoio={`${totais.ganhos} ganhos, ${totais.perdidos} perdidos`}
                />
              </div>

              <Bloco
                titulo="Faturamento por mês do evento"
                descricao="Só atendimentos finalizados, agrupados pela data do evento."
              >
                <Colunas meses={dados.porMes} />
              </Bloco>

              <div className="grid gap-4 lg:grid-cols-2">
                <Bloco titulo="Por interesse">
                  <Barras fatias={dados.porInteresse} />
                </Bloco>
                <Bloco titulo="Por ocasião" descricao="Ajuda a antecipar a sazonalidade.">
                  <Barras fatias={dados.porOcasiao} mostrarValor={false} />
                </Bloco>
              </div>
            </>
          )}

          {aba === 'funil' && (
            <>
              <Bloco
                titulo="Onde estão os atendimentos"
                descricao="Quantidade e valor parados em cada etapa do funil."
              >
                <Funil etapas={dados.funil} />
              </Bloco>

              <div className="grid gap-3 sm:grid-cols-3">
                <Indicador
                  rotulo="Taxa de conversão"
                  valor={`${totais.conversao.toFixed(0)}%`}
                  apoio="Sobre os que já terminaram"
                  destaque
                />
                <Indicador rotulo="Ganhos" valor={String(totais.ganhos)} />
                <Indicador rotulo="Perdidos" valor={String(totais.perdidos)} />
              </div>

              <p className="rounded-xl border border-borda bg-superficie px-4 py-3 text-[12px] text-texto-suave">
                A conversão considera apenas atendimentos finalizados ou perdidos. Quem ainda
                está no funil não conta como perda, senão a taxa despencaria sem motivo real.
              </p>
            </>
          )}

          {aba === 'interesse' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Bloco titulo="Por interesse" descricao="Quantidade e valor de cada serviço.">
                <Barras fatias={dados.porInteresse} />
              </Bloco>
              <Bloco titulo="Por ocasião">
                <Barras fatias={dados.porOcasiao} />
              </Bloco>
              <Bloco
                titulo="Por origem do lead"
                descricao="De onde vieram os atendimentos do período."
              >
                <Barras fatias={dados.porOrigem} />
              </Bloco>
            </div>
          )}

          {aba === 'perdas' && (
            <>
              <Bloco
                titulo="Por que perdemos"
                descricao="Motivo registrado quando o atendimento foi para Perdido."
              >
                <Barras
                  fatias={dados.motivosPerda}
                  mostrarValor={false}
                  vazio="Nenhum atendimento perdido no período"
                />
              </Bloco>

              {dados.motivosPerda.length === 0 && totais.perdidos > 0 && (
                <p className="rounded-xl border border-borda bg-alerta-fraco px-4 py-3 text-[12px] text-alerta">
                  Há {totais.perdidos} atendimentos perdidos sem motivo preenchido. O motivo é
                  parte do checklist da etapa Perdido.
                </p>
              )}
            </>
          )}

          {aba === 'equipe' && (
            <Bloco
              titulo="Desempenho por atendente"
              descricao="Faturamento vem dos atendimentos finalizados."
            >
              {dados.porResponsavel.length === 0 ? (
                <Vazio texto="Nenhum atendimento com responsável no período" />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Atendente', 'Atendimentos', 'Ganhos', 'Conversão', 'Faturamento'].map(
                        (coluna) => (
                          <th
                            key={coluna}
                            className="border-b border-borda pb-2 text-left text-[11px] font-semibold tracking-wide text-texto-fraco uppercase last:text-right"
                          >
                            {coluna}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {dados.porResponsavel.map((pessoa) => (
                      <tr key={pessoa.rotulo}>
                        <td className="border-b border-borda-suave py-2.5 text-[13px] font-medium text-texto">
                          {pessoa.rotulo}
                        </td>
                        <td className="border-b border-borda-suave py-2.5 text-[13px] text-texto-suave tabular-nums">
                          {pessoa.total}
                        </td>
                        <td className="border-b border-borda-suave py-2.5 text-[13px] text-texto-suave tabular-nums">
                          {pessoa.ganhos}
                        </td>
                        <td className="border-b border-borda-suave py-2.5 text-[13px] text-texto-suave tabular-nums">
                          {pessoa.conversao.toFixed(0)}%
                        </td>
                        <td className="border-b border-borda-suave py-2.5 text-right text-[13px] font-medium text-texto tabular-nums">
                          {formatarMoeda(pessoa.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Bloco>
          )}
        </>
      )}
    </div>
  );
};
