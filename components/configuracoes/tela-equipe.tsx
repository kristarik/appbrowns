'use client';

import { useActionState, useState, useTransition } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Aviso, botao, Campo, Cartao, entrada } from './cartao';
import {
  alternarAtivo,
  criarUsuario,
  excluirUsuario,
  mudarPapel,
  type Resultado,
} from '@/app/configuracoes-acoes';
import type { UsuarioDaEquipe } from '@/lib/consultas';
import { PAPEIS, papeisQuePodeConceder, podeMexerEm } from '@/lib/permissoes';
import type { Sessao } from '@/lib/sessao';
import type { Papel } from '@/lib/tipos';
import { cn, iniciais } from '@/lib/utils';

type Props = {
  usuarios: UsuarioDaEquipe[];
  usuario: Sessao;
};

export const TelaEquipe = ({ usuarios, usuario }: Props) => {
  const [aberto, setAberto] = useState(false);
  const [confirmando, setConfirmando] = useState<string>();
  const [novo, acaoNovo, salvandoNovo] = useActionState<Resultado, FormData>(criarUsuario, {});
  const [acao, setAcao] = useState<Resultado>({});
  const [processando, iniciar] = useTransition();

  const concedeveis = papeisQuePodeConceder(usuario.papel);

  const executar = (promessa: () => Promise<Resultado>) =>
    iniciar(async () => {
      setAcao(await promessa());
      setConfirmando(undefined);
    });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Cartao
        titulo="Quem tem acesso"
        descricao="Desativar tira a pessoa do sistema na hora, mesmo se estiver com o painel aberto."
      >
        <ul className="flex flex-col divide-y divide-borda-suave">
          {usuarios.map((u) => {
            const euMesmo = u.id === usuario.id;
            const alcanco = !euMesmo && podeMexerEm(usuario.papel, u.papel);

            return (
              <li key={u.id} className="flex flex-wrap items-center gap-2.5 py-3 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                    u.ativo ? 'bg-marca-fraca text-marca' : 'bg-borda-suave text-texto-fraco',
                  )}
                >
                  {iniciais(u.nome)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-texto">
                    {u.nome}
                    {euMesmo && (
                      <span className="rounded bg-borda-suave px-1 text-[10px] font-normal text-texto-suave">
                        você
                      </span>
                    )}
                    {!u.ativo && (
                      <span className="rounded bg-perigo-fraco px-1 text-[10px] font-medium text-perigo">
                        desativado
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[12px] text-texto-fraco">{u.email}</p>
                </div>

                {alcanco ? (
                  <select
                    value={u.papel}
                    disabled={processando}
                    onChange={(e) => executar(() => mudarPapel(u.id, e.target.value as Papel))}
                    className="shrink-0 rounded-lg border border-borda bg-fundo px-2 py-1 text-[12px] text-texto outline-none disabled:opacity-50"
                  >
                    {concedeveis.map((papel) => (
                      <option key={papel} value={papel}>
                        {PAPEIS[papel].nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="shrink-0 rounded-md bg-borda-suave px-2 py-1 text-[12px] text-texto-suave">
                    {PAPEIS[u.papel].nome}
                  </span>
                )}

                {alcanco && (
                  <>
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => executar(() => alternarAtivo(u.id, !u.ativo))}
                      className={cn(
                        'shrink-0 rounded-lg border border-borda px-2.5 py-1 text-[12px] text-texto-suave transition-colors disabled:opacity-40',
                        u.ativo ? 'hover:border-perigo hover:text-perigo' : 'hover:border-sucesso hover:text-sucesso',
                      )}
                    >
                      {u.ativo ? 'Desativar' : 'Reativar'}
                    </button>

                    {confirmando === u.id ? (
                      <span className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={processando}
                          onClick={() => executar(() => excluirUsuario(u.id))}
                          className="rounded-lg bg-perigo px-2.5 py-1 text-[12px] font-medium text-white disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmando(undefined)}
                          className="rounded-lg px-2 py-1 text-[12px] text-texto-suave hover:text-texto"
                        >
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={processando}
                        onClick={() => setConfirmando(u.id)}
                        aria-label={`Excluir ${u.nome}`}
                        className="shrink-0 rounded-lg p-1.5 text-texto-fraco transition-colors hover:bg-perigo-fraco hover:text-perigo disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>

        <Aviso estado={acao} />
      </Cartao>

      <Cartao titulo="Adicionar pessoa" descricao="Ela pode trocar a senha depois, em Geral.">
        {aberto ? (
          <form action={acaoNovo} className="flex flex-col gap-4">
            <Campo rotulo="Nome">
              <input name="nome" required className={entrada} />
            </Campo>

            <Campo rotulo="E-mail">
              <input name="email" type="email" required className={entrada} />
            </Campo>

            <Campo rotulo="Senha inicial" ajuda="Mínimo de 8 caracteres.">
              <input name="senha" type="text" required minLength={8} className={entrada} />
            </Campo>

            <Campo rotulo="Papel">
              <select name="papel" defaultValue="atendente" className={entrada}>
                {concedeveis.map((papel) => (
                  <option key={papel} value={papel}>
                    {PAPEIS[papel].nome}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="flex items-center gap-2">
              <button type="submit" disabled={salvandoNovo} className={botao}>
                {salvandoNovo && <Loader2 size={14} className="animate-spin" />}
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-lg px-3 py-2 text-[13px] text-texto-suave transition-colors hover:text-texto"
              >
                Cancelar
              </button>
            </div>

            <Aviso estado={novo} />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-borda px-3 py-2 text-[13px] text-texto-suave transition-colors hover:border-marca hover:text-marca"
          >
            <Plus size={14} />
            Adicionar pessoa
          </button>
        )}
      </Cartao>

      <Cartao titulo="O que cada papel pode fazer">
        <ul className="flex flex-col gap-3">
          {(['admin', 'gerente', 'atendente'] as Papel[]).map((papel) => (
            <li key={papel} className="flex items-start gap-2.5">
              <span
                className={cn(
                  'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                  papel === 'admin'
                    ? 'bg-marca'
                    : papel === 'gerente'
                      ? 'bg-alerta'
                      : 'bg-texto-fraco',
                )}
              />
              <div>
                <p className="text-[13px] font-medium text-texto">{PAPEIS[papel].nome}</p>
                <p className="text-[12px] text-texto-suave">{PAPEIS[papel].descricao}</p>
              </div>
            </li>
          ))}
        </ul>

        {usuario.papel === 'gerente' && (
          <p className="mt-4 rounded-lg bg-borda-suave px-3 py-2 text-[12px] text-texto-suave">
            Como gerente, você gerencia atendentes e outros gerentes. Administradores só são
            alterados por outro administrador.
          </p>
        )}
      </Cartao>
    </div>
  );
};
