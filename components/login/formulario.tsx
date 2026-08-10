'use client';

import { useActionState, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { entrar, type EstadoLogin } from '@/app/acoes';
import type { ConfiguracaoGeral } from '@/lib/consultas';
import { VERSAO } from '@/lib/versao';
import { tomEscuro } from '@/lib/utils';

export const FormularioLogin = ({ configuracao }: { configuracao: ConfiguracaoGeral }) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});

  // A tela de login fica fora do painel, entao aplica o tema por conta propria.
  const tema = `:root{--marca:${configuracao.corMarca};--marca-escura:${tomEscuro(
    configuracao.corMarca,
  )};--marca-fraca:${configuracao.corSuave}}`;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-fundo px-4">
      <style dangerouslySetInnerHTML={{ __html: tema }} />

      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center">
          {configuracao.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={configuracao.logoUrl}
              alt={configuracao.nomeLoja}
              className="h-auto w-52 max-w-full"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-texto text-lg font-semibold tracking-tight text-white">
              {configuracao.nomeLoja.charAt(0).toUpperCase()}
            </span>
          )}

          <p className="mt-4 text-[13px] text-texto-suave">Acesso ao painel</p>
        </div>

        <form action={acao} className="rounded-2xl border border-borda bg-superficie p-6">
          <label className="block">
            <span className="text-[13px] font-medium text-texto">E-mail</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="voce@browns.com.br"
              className="mt-1.5 w-full rounded-lg border border-borda bg-fundo px-3 py-2 text-[13px] text-texto outline-none transition-colors placeholder:text-texto-fraco focus:border-marca"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-[13px] font-medium text-texto">Senha</span>
            <div className="mt-1.5 flex items-center rounded-lg border border-borda bg-fundo focus-within:border-marca">
              <input
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-transparent px-3 py-2 text-[13px] text-texto outline-none placeholder:text-texto-fraco"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((m) => !m)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="px-3 text-texto-fraco transition-colors hover:text-texto"
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {estado.erro && (
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-perigo-fraco px-3 py-2 text-[12px] text-perigo">
              <AlertCircle size={14} className="shrink-0" />
              {estado.erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-marca py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-marca-escura disabled:opacity-60"
          >
            {enviando && <Loader2 size={15} className="animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-texto-fraco">v{VERSAO}</p>
      </div>
    </div>
  );
};
