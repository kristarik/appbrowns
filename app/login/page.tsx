'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { VERSAO } from '@/lib/versao';

const PaginaLogin = () => {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Autenticacao real entra na v0.2.0, junto com o banco.
  const entrar = (evento: React.FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    router.push('/chat');
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-fundo px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-texto text-lg font-semibold tracking-tight text-white">
            B
          </span>
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-texto">
            Browns Alfaiataria
          </h1>
          <p className="text-[13px] text-texto-suave">Acesso ao painel</p>
        </div>

        <form
          onSubmit={entrar}
          className="rounded-2xl border border-borda bg-superficie p-6"
        >
          <label className="block">
            <span className="text-[13px] font-medium text-texto">E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="voce@browns.com.br"
              className="mt-1.5 w-full rounded-lg border border-borda bg-fundo px-3 py-2 text-[13px] text-texto outline-none transition-colors placeholder:text-texto-fraco focus:border-marca"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-[13px] font-medium text-texto">Senha</span>
            <div className="mt-1.5 flex items-center rounded-lg border border-borda bg-fundo focus-within:border-marca">
              <input
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

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-marca py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-marca-escura disabled:opacity-60"
          >
            {enviando && <Loader2 size={15} className="animate-spin" />}
            Entrar
          </button>

          <p className="mt-4 rounded-lg bg-alerta-fraco px-3 py-2 text-center text-[12px] text-alerta">
            Tela de demonstração. A autenticação real entra na v0.2.0.
          </p>
        </form>

        <p className="mt-4 text-center text-[11px] text-texto-fraco">v{VERSAO}</p>
      </div>
    </div>
  );
};

export default PaginaLogin;
