'use client';

import { useActionState, useState, useTransition } from 'react';
import { Loader2, Plus, ShieldCheck, UserRound } from 'lucide-react';
import { Aviso, botao, Campo, Cartao, entrada } from './cartao';
import {
  alternarAtivo,
  criarUsuario,
  mudarPapel,
  type Resultado,
} from '@/app/configuracoes-acoes';
import type { UsuarioDaEquipe } from '@/lib/consultas';
import type { Sessao } from '@/lib/sessao';
import { cn, iniciais } from '@/lib/utils';

type Props = {
  usuarios: UsuarioDaEquipe[];
  usuario: Sessao;
};

export const TelaEquipe = ({ usuarios, usuario }: Props) => {
  const admin = usuario.papel === 'admin';
  const [aberto, setAberto] = useState(false);
  const [novo, acaoNovo, salvandoNovo] = useActionState<Resultado, FormData>(criarUsuario, {});
  const [acao, setAcao] = useState<Resultado>({});
  const [processando, iniciar] = useTransition();

  const executar = (promessa: () => Promise<Resultado>) =>
    iniciar(async () => setAcao(await promessa()));

  if (!admin) {
    return (
      <div className="mx-auto max-w-2xl">
        <Cartao titulo="Equipe" descricao="Só administradores podem gerenciar a equipe.">
          <ul className="flex flex-col gap-2">
            {usuarios
              .filter((u) => u.ativo)
              .map((u) => (
                <li key={u.id} className="flex items-center gap-3 text-[13px] text-texto">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-marca-fraca text-[10px] font-semibold text-marca">
                    {iniciais(u.nome)}
                  </span>
                  {u.nome}
                  <span className="text-texto-fraco">{u.email}</span>
                </li>
              ))}
          </ul>
        </Cartao>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Cartao
        titulo="Quem tem acesso"
        descricao="Desativar tira a pessoa do sistema na hora, mesmo se estiver com o painel aberto."
      >
        <ul className="flex flex-col divide-y divide-borda-suave">
          {usuarios.map((u) => {
            const euMesmo = u.id === usuario.id;

            return (
              <li key={u.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                    u.ativo ? 'bg-marca-fraca text-marca' : 'bg-borda-suave text-texto-fraco',
                  )}
                >
                  {iniciais(u.nome)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-texto">
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

                <select
                  value={u.papel}
                  disabled={euMesmo || processando}
                  onChange={(e) =>
                    executar(() => mudarPapel(u.id, e.target.value as 'admin' | 'atendente'))
                  }
                  className="shrink-0 rounded-lg border border-borda bg-fundo px-2 py-1 text-[12px] text-texto outline-none disabled:opacity-50"
                >
                  <option value="admin">Administrador</option>
                  <option value="atendente">Atendente</option>
                </select>

                <button
                  type="button"
                  disabled={euMesmo || processando}
                  onClick={() => executar(() => alternarAtivo(u.id, !u.ativo))}
                  className={cn(
                    'shrink-0 rounded-lg border px-2.5 py-1 text-[12px] transition-colors disabled:opacity-40',
                    u.ativo
                      ? 'border-borda text-texto-suave hover:border-perigo hover:text-perigo'
                      : 'border-borda text-texto-suave hover:border-sucesso hover:text-sucesso',
                  )}
                >
                  {u.ativo ? 'Desativar' : 'Reativar'}
                </button>
              </li>
            );
          })}
        </ul>

        <Aviso estado={acao} />
      </Cartao>

      <Cartao titulo="Adicionar pessoa" descricao="A senha pode ser trocada por ela depois, em Geral.">
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
                <option value="atendente">Atendente</option>
                <option value="admin">Administrador</option>
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
          <li className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-marca" />
            <div>
              <p className="text-[13px] font-medium text-texto">Administrador</p>
              <p className="text-[12px] text-texto-suave">
                Tudo do atendente, mais gerenciar equipe, integrações e dados da loja.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <UserRound size={16} className="mt-0.5 shrink-0 text-texto-fraco" />
            <div>
              <p className="text-[13px] font-medium text-texto">Atendente</p>
              <p className="text-[12px] text-texto-suave">
                Conversas, funil, clientes e follow-ups. Troca a própria senha.
              </p>
            </div>
          </li>
        </ul>
      </Cartao>
    </div>
  );
};
