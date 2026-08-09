'use client';

import { useActionState, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Aviso, botao, Campo, Cartao, entrada } from './cartao';
import {
  renomearMeuPerfil,
  salvarGeral,
  trocarMinhaSenha,
  type Resultado,
} from '@/app/configuracoes-acoes';
import type { ConfiguracaoGeral } from '@/lib/consultas';
import { gerenciarSistema } from '@/lib/permissoes';
import type { Sessao } from '@/lib/sessao';

type Props = {
  configuracao: ConfiguracaoGeral;
  usuario: Sessao;
};

export const TelaGeral = ({ configuracao, usuario }: Props) => {
  const [cor, setCor] = useState(configuracao.corMarca);
  const [geral, acaoGeral, salvandoGeral] = useActionState<Resultado, FormData>(
    salvarGeral,
    {},
  );
  const [perfil, acaoPerfil, salvandoPerfil] = useActionState<Resultado, FormData>(
    renomearMeuPerfil,
    {},
  );
  const [senha, acaoSenha, salvandoSenha] = useActionState<Resultado, FormData>(
    trocarMinhaSenha,
    {},
  );

  const admin = gerenciarSistema(usuario.papel);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Cartao
        titulo="A loja"
        descricao={
          admin
            ? 'Aparece no topo do painel e na tela de login.'
            : 'Só administradores podem alterar estes dados.'
        }
      >
        <form action={acaoGeral} className="flex flex-col gap-4">
          <Campo rotulo="Nome da loja">
            <input
              name="nomeLoja"
              defaultValue={configuracao.nomeLoja}
              disabled={!admin}
              required
              className={entrada}
            />
          </Campo>

          <Campo rotulo="Cor da marca" ajuda="Usada nos destaques, botões e itens selecionados.">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                disabled={!admin}
                aria-label="Escolher cor"
                className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-borda bg-fundo"
              />
              <input
                name="corMarca"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                disabled={!admin}
                required
                className={`${entrada} font-mono`}
              />
            </div>
          </Campo>

          <Campo
            rotulo="Logo (endereço da imagem)"
            ajuda="Cole o link de um PNG ou SVG. Envio de arquivo entra quando o painel tiver armazenamento próprio."
          >
            <input
              name="logoUrl"
              type="url"
              defaultValue={configuracao.logoUrl ?? ''}
              disabled={!admin}
              placeholder="https://..."
              className={entrada}
            />
          </Campo>

          {admin && (
            <div className="flex items-center gap-3">
              <button type="submit" disabled={salvandoGeral} className={botao}>
                {salvandoGeral && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
            </div>
          )}

          <Aviso estado={geral} />
        </form>
      </Cartao>

      <Cartao titulo="Meu perfil" descricao={usuario.email}>
        <form action={acaoPerfil} className="flex flex-col gap-4">
          <Campo rotulo="Nome">
            <input name="nome" defaultValue={usuario.nome} required className={entrada} />
          </Campo>

          <div>
            <button type="submit" disabled={salvandoPerfil} className={botao}>
              {salvandoPerfil && <Loader2 size={14} className="animate-spin" />}
              Salvar nome
            </button>
          </div>

          <Aviso estado={perfil} />
        </form>
      </Cartao>

      <Cartao titulo="Trocar minha senha" descricao="Mínimo de 8 caracteres.">
        <form action={acaoSenha} className="flex flex-col gap-4">
          <Campo rotulo="Senha atual">
            <input
              name="atual"
              type="password"
              autoComplete="current-password"
              required
              className={entrada}
            />
          </Campo>

          <Campo rotulo="Nova senha">
            <input
              name="nova"
              type="password"
              autoComplete="new-password"
              required
              className={entrada}
            />
          </Campo>

          <Campo rotulo="Repita a nova senha">
            <input
              name="confirmacao"
              type="password"
              autoComplete="new-password"
              required
              className={entrada}
            />
          </Campo>

          <div>
            <button type="submit" disabled={salvandoSenha} className={botao}>
              {salvandoSenha && <Loader2 size={14} className="animate-spin" />}
              Trocar senha
            </button>
          </div>

          <Aviso estado={senha} />
        </form>
      </Cartao>
    </div>
  );
};
