'use client';

import { useActionState, useState, useTransition } from 'react';
import { Loader2, Plug, Trash2 } from 'lucide-react';
import { Aviso, botao, Campo, Cartao, entrada } from './cartao';
import {
  limparIntegracao,
  salvarIntegracao,
  testarIntegracao,
  type Resultado,
} from '@/app/configuracoes-acoes';
import { CAMPOS_INTEGRACAO, DESCRICOES_INTEGRACAO as DESCRICOES } from '@/lib/integracoes';
import type { IntegracaoResumo } from '@/lib/consultas';
import type { Sessao } from '@/lib/sessao';
import { cn } from '@/lib/utils';

const Formulario = ({
  id,
  salvo,
  podeEditar,
}: {
  id: string;
  salvo?: IntegracaoResumo;
  podeEditar: boolean;
}) => {
  const [estado, acao, salvando] = useActionState<Resultado, FormData>(salvarIntegracao, {});
  const [outro, setOutro] = useState<Resultado>({});
  const [processando, iniciar] = useTransition();

  const info = DESCRICOES[id];
  const campos = CAMPOS_INTEGRACAO[id];

  return (
    <Cartao titulo={info.nome} descricao={info.texto}>
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium',
            salvo?.ativa
              ? 'bg-sucesso-fraco text-sucesso'
              : 'bg-borda-suave text-texto-suave',
          )}
        >
          <Plug size={11} />
          {salvo?.ativa ? 'Credenciais completas' : 'Não configurada'}
        </span>
      </div>

      <form action={acao} className="flex flex-col gap-4">
        <input type="hidden" name="integracao" value={id} />

        {campos.map((campo) => {
          const guardado = salvo?.campos[campo.id];

          return (
            <Campo
              key={campo.id}
              rotulo={campo.rotulo}
              ajuda={
                guardado
                  ? `Salvo: ${guardado}. Deixe em branco para manter.`
                  : campo.ajuda
              }
            >
              <input
                name={campo.id}
                type="text"
                autoComplete="off"
                disabled={!podeEditar}
                placeholder={guardado ? 'manter o valor salvo' : ''}
                className={entrada}
              />
            </Campo>
          );
        })}

        {podeEditar && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={salvando} className={botao}>
              {salvando && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>

            <button
              type="button"
              disabled={processando}
              onClick={() => iniciar(async () => setOutro(await testarIntegracao(id)))}
              className="rounded-lg border border-borda px-3 py-2 text-[13px] text-texto-suave transition-colors hover:text-texto disabled:opacity-50"
            >
              Conferir campos
            </button>

            {salvo && (
              <button
                type="button"
                disabled={processando}
                onClick={() => iniciar(async () => setOutro(await limparIntegracao(id)))}
                className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-texto-fraco transition-colors hover:text-perigo disabled:opacity-50"
              >
                <Trash2 size={14} />
                Remover
              </button>
            )}
          </div>
        )}

        <Aviso estado={estado} />
        <Aviso estado={outro} />
      </form>
    </Cartao>
  );
};

type Props = {
  integracoes: IntegracaoResumo[];
  usuario: Sessao;
};

export const TelaIntegracoes = ({ integracoes, usuario }: Props) => {
  const podeEditar = usuario.papel === 'admin';

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <p className="rounded-xl border border-borda bg-alerta-fraco px-4 py-3 text-[12px] text-alerta">
        Guardar as credenciais aqui ainda não liga o WhatsApp nem o Bling ao painel. É o
        primeiro passo: a troca de mensagens e a sincronia de pedidos são a próxima etapa do
        projeto.
      </p>

      {Object.keys(CAMPOS_INTEGRACAO).map((id) => (
        <Formulario
          key={id}
          id={id}
          salvo={integracoes.find((i) => i.id === id)}
          podeEditar={podeEditar}
        />
      ))}

      {!podeEditar && (
        <p className="text-center text-[12px] text-texto-fraco">
          Só administradores podem alterar integrações.
        </p>
      )}
    </div>
  );
};
