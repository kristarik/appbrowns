'use client';

import { useState } from 'react';
import { Check, Paperclip, PanelRightClose, PanelRightOpen, Send, Smile } from 'lucide-react';
import { CANAIS, type Conversa } from '@/lib/tipos';
import { cliente, mensagensDaConversa } from '@/lib/dados-simulados';
import { cn, iniciais } from '@/lib/utils';

type Props = {
  conversa: Conversa;
  detalhesAbertos: boolean;
  aoAlternarDetalhes: () => void;
};

const horaCurta = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const PainelChat = ({ conversa, detalhesAbertos, aoAlternarDetalhes }: Props) => {
  const [rascunho, setRascunho] = useState('');
  const dados = cliente(conversa.clienteId);
  const mensagens = mensagensDaConversa(conversa.id);

  if (!dados) return null;

  const canal = CANAIS[conversa.canal];

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-superficie">
      <header className="flex items-center gap-3 border-b border-borda px-5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca text-xs font-semibold text-white">
          {iniciais(dados.nome)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-texto">
            {dados.nome}
          </p>
          <p className="flex items-center gap-1.5 text-[12px] text-texto-suave">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: canal.cor }}
            />
            {canal.nome} · Browns
            <button
              type="button"
              onClick={aoAlternarDetalhes}
              className="ml-1 text-marca transition-colors hover:text-marca-escura"
            >
              {detalhesAbertos ? 'Fechar detalhes' : 'Ver detalhes'}
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={aoAlternarDetalhes}
          aria-label={detalhesAbertos ? 'Fechar detalhes' : 'Abrir detalhes'}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-texto-fraco transition-colors hover:bg-borda-suave hover:text-texto"
        >
          {detalhesAbertos ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-sucesso px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:brightness-95"
        >
          <Check size={15} />
          Resolver
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {mensagens.map((mensagem) => {
          const minha = mensagem.direcao === 'enviada';

          return (
            <div
              key={mensagem.id}
              className={cn('flex flex-col', minha ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[68%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed',
                  minha
                    ? 'rounded-br-sm bg-marca-fraca text-texto'
                    : 'rounded-bl-sm bg-fundo text-texto',
                )}
              >
                {mensagem.conteudo}
              </div>
              <span className="mt-1 px-1 text-[11px] text-texto-fraco">
                {horaCurta(mensagem.enviadaEm)}
                {minha && ' · Ana'}
              </span>
            </div>
          );
        })}
      </div>

      <footer className="border-t border-borda px-5 py-3">
        <div className="rounded-xl border border-borda bg-fundo focus-within:border-marca">
          <textarea
            value={rascunho}
            onChange={(evento) => setRascunho(evento.target.value)}
            rows={2}
            placeholder={`Responder para ${dados.nome.split(' ')[0]}...`}
            className="w-full resize-none bg-transparent px-3.5 pt-2.5 text-[13px] text-texto outline-none placeholder:text-texto-fraco"
          />

          <div className="flex items-center justify-between px-2.5 pb-2">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Anexar arquivo"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-texto-fraco transition-colors hover:bg-borda-suave hover:text-texto"
              >
                <Paperclip size={16} />
              </button>
              <button
                type="button"
                aria-label="Inserir emoji"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-texto-fraco transition-colors hover:bg-borda-suave hover:text-texto"
              >
                <Smile size={16} />
              </button>
            </div>

            <button
              type="button"
              disabled={!rascunho.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-marca-escura disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={14} />
              Enviar
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
};
