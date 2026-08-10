'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Barras, Bloco, Colunas, Indicador, Vazio } from './pecas';
import { atualizarMarketing, type ResultadoAtualizacao } from '@/app/marketing-acoes';
import { ABAS_MARKETING, type AbaMarketing } from '@/lib/abas-relatorio';
import { PERIODOS, type Periodo } from '@/lib/periodos';
import type { RelatorioMarketing } from '@/lib/relatorios-marketing';
import { cn, formatarMoeda } from '@/lib/utils';

const endereco = (aba: AbaMarketing, periodo: Periodo) =>
  `/relatorios?aba=${aba}${periodo === '90' ? '' : `&periodo=${periodo}`}`;

// Agrupa a serie diaria por mes, senao um periodo de 12 meses viraria 365
// colunas de um pixel cada.
const porMes = (serie: { data: string; valor: number }[]) => {
  const mapa = new Map<string, number>();

  for (const ponto of serie) {
    const chave = ponto.data.slice(0, 7);
    mapa.set(chave, (mapa.get(chave) ?? 0) + ponto.valor);
  }

  return [...mapa.entries()].slice(-12).map(([chave, valor]) => {
    const [ano, mes] = chave.split('-');
    return {
      rotulo: new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      }),
      total: valor,
      valor,
    };
  });
};

const numero = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

export const TelaMarketing = ({
  dados,
  aba,
}: {
  dados: RelatorioMarketing;
  aba: AbaMarketing;
}) => {
  const [estado, setEstado] = useState<ResultadoAtualizacao>({});
  const [atualizando, iniciar] = useTransition();
  const { periodo } = dados;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-texto">
            Relatório de marketing
          </h2>
          <p className="text-[12px] text-texto-suave">
            {dados.atualizadoEm
              ? `Atualizado em ${new Date(dados.atualizadoEm).toLocaleString('pt-BR')}`
              : 'Ainda não sincronizado'}
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

          <button
            type="button"
            disabled={atualizando}
            onClick={() => iniciar(async () => setEstado(await atualizarMarketing()))}
            className="ml-1 flex items-center gap-1.5 rounded-lg border border-borda bg-superficie px-2.5 py-1.5 text-[13px] text-texto-suave transition-colors hover:text-texto disabled:opacity-50"
          >
            {atualizando ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Atualizar agora
          </button>
        </div>
      </header>

      {(estado.erro || estado.ok) && (
        <p
          className={cn(
            'flex items-start gap-2 rounded-xl px-4 py-3 text-[12px]',
            estado.erro ? 'bg-perigo-fraco text-perigo' : 'bg-sucesso-fraco text-sucesso',
          )}
        >
          {estado.erro ? (
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
          )}
          {estado.erro ?? estado.ok}
        </p>
      )}

      <nav className="flex flex-wrap gap-1 border-b border-borda">
        {ABAS_MARKETING.map((item) => (
          <Link
            key={item.id}
            href={endereco(item.id, periodo)}
            className={cn(
              'relative -mb-px px-3 py-2 text-[13px] transition-colors',
              aba === item.id ? 'font-medium text-marca' : 'text-texto-suave hover:text-texto',
            )}
          >
            {item.rotulo}
            {aba === item.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-marca" />
            )}
          </Link>
        ))}
      </nav>

      {aba === 'origem' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador
              rotulo="Investido no Ads"
              valor={formatarMoeda(dados.ads.investido)}
              apoio={`${numero(dados.ads.cliques)} cliques`}
              destaque
            />
            <Indicador
              rotulo="Custo por lead"
              valor={dados.custoPorLead ? formatarMoeda(dados.custoPorLead) : '—'}
              apoio="Leads marcados como Google Ads"
            />
            <Indicador
              rotulo="Custo por venda"
              valor={dados.custoPorVenda ? formatarMoeda(dados.custoPorVenda) : '—'}
              apoio="Vendas de leads do Ads"
            />
            <Indicador
              rotulo="Cliques no orgânico"
              valor={numero(dados.busca.cliques)}
              apoio="Vindos da busca do Google"
            />
          </div>

          <Bloco
            titulo="De onde vieram os atendimentos"
            descricao="Cruzamento do campo Origem do lead com o que cada origem faturou."
          >
            {dados.origens.length === 0 ? (
              <Vazio texto="Nenhum atendimento cadastrado no período" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    {['Origem', 'Leads', 'Vendas', 'Conversão', 'Faturamento'].map((coluna) => (
                      <th
                        key={coluna}
                        className="border-b border-borda pb-2 text-left text-[11px] font-semibold tracking-wide text-texto-fraco uppercase last:text-right"
                      >
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.origens.map((origem) => (
                    <tr key={origem.rotulo}>
                      <td className="border-b border-borda-suave py-2.5 text-[13px] font-medium text-texto">
                        {origem.rotulo}
                      </td>
                      <td className="border-b border-borda-suave py-2.5 text-[13px] text-texto-suave tabular-nums">
                        {origem.leads}
                      </td>
                      <td className="border-b border-borda-suave py-2.5 text-[13px] text-texto-suave tabular-nums">
                        {origem.ganhos}
                      </td>
                      <td className="border-b border-borda-suave py-2.5 text-[13px] text-texto-suave tabular-nums">
                        {origem.leads > 0
                          ? `${((origem.ganhos / origem.leads) * 100).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td className="border-b border-borda-suave py-2.5 text-right text-[13px] font-medium text-texto tabular-nums">
                        {formatarMoeda(origem.faturamento)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Bloco>

          {!dados.custoPorLead && dados.ads.investido > 0 && (
            <p className="rounded-xl border border-borda bg-alerta-fraco px-4 py-3 text-[12px] text-alerta">
              Há investimento em anúncio no período, mas nenhum atendimento marcado como vindo
              do Google Ads. Sem o campo Origem do lead preenchido, não dá para saber o custo
              por lead.
            </p>
          )}
        </>
      )}

      {aba === 'google-ads' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador
              rotulo="Investido"
              valor={formatarMoeda(dados.ads.investido)}
              destaque
            />
            <Indicador
              rotulo="Cliques"
              valor={numero(dados.ads.cliques)}
              apoio={`${numero(dados.ads.impressoes)} impressões`}
            />
            <Indicador
              rotulo="Custo por clique"
              valor={formatarMoeda(dados.ads.cpc)}
              apoio={`CTR de ${dados.ads.ctr.toFixed(2)}%`}
            />
            <Indicador
              rotulo="Conversões"
              valor={numero(dados.ads.conversoes)}
              apoio={
                dados.ads.custoPorConversao > 0
                  ? `${formatarMoeda(dados.ads.custoPorConversao)} cada`
                  : 'Sem conversões'
              }
            />
          </div>

          <Bloco titulo="Investimento por mês">
            <Colunas meses={porMes(dados.ads.porDia)} />
          </Bloco>

          <p className="rounded-xl border border-borda bg-superficie px-4 py-3 text-[12px] text-texto-suave">
            Conversão aqui é a que o Google Ads registra no site. Não é a mesma coisa que venda
            fechada: para isso, veja a aba Origem dos leads, que cruza com o funil.
          </p>
        </>
      )}

      {aba === 'site' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador rotulo="Sessões" valor={numero(dados.site.sessoes)} destaque />
            <Indicador rotulo="Usuários" valor={numero(dados.site.usuarios)} />
            <Indicador rotulo="Páginas vistas" valor={numero(dados.site.paginas)} />
            <Indicador
              rotulo="Eventos-chave"
              valor={numero(dados.site.eventosChave)}
              apoio="Configurados no Analytics"
            />
          </div>

          <Bloco titulo="Sessões por mês">
            <Colunas
              meses={porMes(dados.site.porDia)}
              moeda={false}
              vazio="Sem dados do Analytics no período"
            />
          </Bloco>

          <div className="grid gap-4 lg:grid-cols-2">
            <Bloco
              titulo="Buscas que trazem visita"
              descricao={`${numero(dados.busca.cliques)} cliques, posição média ${dados.busca.posicaoMedia.toFixed(1)}`}
            >
              <Barras
                fatias={dados.busca.termos.map((t) => ({
                  rotulo: t.termo,
                  total: t.cliques,
                  valor: 0,
                }))}
                mostrarValor={false}
                vazio="Sem dados do Search Console no período"
              />
            </Bloco>

            <Bloco titulo="Páginas mais acessadas pela busca">
              <Barras
                fatias={dados.busca.paginas.map((p) => ({
                  rotulo: p.termo.replace(/^https?:\/\/[^/]+/, '') || '/',
                  total: p.cliques,
                  valor: 0,
                }))}
                mostrarValor={false}
                vazio="Sem dados do Search Console no período"
              />
            </Bloco>
          </div>
        </>
      )}

      {dados.avisoSincronia && (
        <p className="rounded-xl border border-borda bg-alerta-fraco px-4 py-3 text-[12px] text-alerta">
          Última sincronização teve problema: {dados.avisoSincronia}
        </p>
      )}
    </div>
  );
};
