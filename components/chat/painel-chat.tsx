'use client';

import { useEffect, useState, useTransition } from 'react';
import { Check, Loader2, PanelRightClose, PanelRightOpen, Send } from 'lucide-react';
import { CANAIS, type Conversa, type Mensagem } from '@/lib/tipos';
import { buscarMensagens, enviarMensagem, resolverConversa } from '@/app/acoes';
import { cn, iniciais } from '@/lib/utils';

type Props = {
  conversa: Conversa;
  detalhesAbertos: boolean;
  aoAlternarDetalhes: () => void;
};

const horaCurta = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const PainelChat = ({ conversa, detalhesAbertos, aoAlternarDetalhes }: Props) => {
  // Guardar junto o id da conversa carregada permite derivar o estado de
  // carregamento, em vez de mexer em outro useState dentro do efeito.
  const [carregado, setCarregado] = useState<{ id: string; mensagens: Mensagem[] }>();
  const [rascunho, setRascunho] = useState('');
  const [enviando, iniciarEnvio] = useTransition();

  useEffect(() => {
    let cancelado = false;

    buscarMensagens(conversa.id).then((lista) => {
      if (!cancelado) setCarregado({ id: conversa.id, mensagens: lista });
    });

    return () => {
      cancelado = true;
    };
  }, [conversa.id]);

  const atual = carregado?.id === conversa.id ? carregado : undefined;
  const carregando = !atual;
  const mensagens = atual?.mensagens ?? [];

  const enviar = () => {
    const texto = rascunho.trim();

    if (!texto) return;

    iniciarEnvio(async () => {
      await enviarMensagem(conversa.id, texto);
      setRascunho('');
      setCarregado({ id: conversa.id, mensagens: await buscarMensagens(conversa.id) });
    });
  };

  const canal = CANAIS[conversa.canal];

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-superficie">
      <header className="flex items-center gap-3 border-b border-borda px-5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca text-xs font-semibold text-white">
          {iniciais(conversa.clienteNome)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-texto">
            {conversa.clienteNome}
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

        {conversa.status === 'aberta' ? (
          <button
            type="button"
            onClick={() => iniciarEnvio(async () => void (await resolverConversa(conversa.id)))}
            className="flex items-center gap-1.5 rounded-lg bg-sucesso px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:brightness-95"
          >
            <Check size={15} />
            Resolver
          </button>
        ) : (
          <span className="flex items-center gap-1.5 rounded-lg bg-sucesso-fraco px-3 py-1.5 text-[13px] font-medium text-sucesso">
            <Check size={15} />
            Resolvida
          </span>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {carregando ? (
          <div className="flex items-center justify-center py-8 text-texto-fraco">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : mensagens.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-texto-fraco">
            Nenhuma mensagem nesta conversa
          </p>
        ) : (
          mensagens.map((mensagem) => {
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
                  {mensagem.enviadaPor && ` · ${mensagem.enviadaPor}`}
                </span>
              </div>
            );
          })
        )}
      </div>

      <footer className="border-t border-borda px-5 py-3">
        <div className="rounded-xl border border-borda bg-fundo focus-within:border-marca">
          <textarea
            value={rascunho}
            onChange={(evento) => setRascunho(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter' && !evento.shiftKey) {
                evento.preventDefault();
                enviar();
              }
            }}
            rows={2}
            placeholder={`Responder para ${conversa.clienteNome.split(' ')[0]}...`}
            className="w-full resize-none bg-transparent px-3.5 pt-2.5 text-[13px] text-texto outline-none placeholder:text-texto-fraco"
          />

          <div className="flex items-center justify-between px-2.5 pb-2">
            <span className="pl-1 text-[11px] text-texto-fraco">
              Enter envia, Shift+Enter quebra linha
            </span>

            <button
              type="button"
              onClick={enviar}
              disabled={!rascunho.trim() || enviando}
              className="flex items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-marca-escura disabled:cursor-not-allowed disabled:opacity-40"
            >
              {enviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Enviar
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
};
