import { db } from '../db';

// Formato que a Meta envia. Só os campos que realmente usamos: o corpo do
// webhook é grande e muda com frequência nas partes que não nos interessam.
export type EventoWhatsapp = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: {
          id: string;
          from: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }[];
      };
    }[];
  }[];
};

const TIPOS_LEGIVEIS: Record<string, string> = {
  image: '[imagem]',
  audio: '[áudio]',
  video: '[vídeo]',
  document: '[documento]',
  sticker: '[figurinha]',
  location: '[localização]',
  contacts: '[contato]',
};

const conteudoDe = (mensagem: { type?: string; text?: { body?: string } }) => {
  if (mensagem.type === 'text') return mensagem.text?.body?.trim() || '[mensagem vazia]';

  return TIPOS_LEGIVEIS[mensagem.type ?? ''] ?? `[${mensagem.type ?? 'desconhecido'}]`;
};

// A Meta manda o número sem "+", só dígitos. Guardamos assim mesmo, para bater
// com o formato E.164 que o resto do painel já usa.
const normalizarTelefone = (bruto: string) => bruto.replace(/\D/g, '');

export type ResultadoRecebimento = {
  processadas: number;
  ignoradas: number;
  clientesNovos: number;
  atendimentosNovos: number;
};

export const receberEvento = async (
  evento: EventoWhatsapp,
): Promise<ResultadoRecebimento> => {
  const resultado: ResultadoRecebimento = {
    processadas: 0,
    ignoradas: 0,
    clientesNovos: 0,
    atendimentosNovos: 0,
  };

  for (const entrada of evento.entry ?? []) {
    for (const mudanca of entrada.changes ?? []) {
      const valor = mudanca.value;
      const mensagens = valor?.messages ?? [];

      for (const mensagem of mensagens) {
        const telefone = normalizarTelefone(mensagem.from);

        if (!telefone) {
          resultado.ignoradas += 1;
          continue;
        }

        // A Meta reenvia o mesmo evento quando não recebe confirmação rápida.
        // Sem esta checagem a conversa encheria de mensagens repetidas.
        const jaExiste = await db.mensagem.findUnique({
          where: { idExterno: mensagem.id },
          select: { id: true },
        });

        if (jaExiste) {
          resultado.ignoradas += 1;
          continue;
        }

        const perfil = valor?.contacts?.find((c) => normalizarTelefone(c.wa_id) === telefone);
        const nomeDoPerfil = perfil?.profile?.name?.trim();

        const existente = await db.cliente.findUnique({ where: { telefone } });

        const cliente =
          existente ??
          (await db.cliente.create({
            data: { telefone, nome: nomeDoPerfil || `Contato ${telefone.slice(-4)}` },
          }));

        if (!existente) resultado.clientesNovos += 1;

        const enviadaEm = mensagem.timestamp
          ? new Date(Number(mensagem.timestamp) * 1000)
          : new Date();

        const conteudo = conteudoDe(mensagem);

        const conversaExistente = await db.conversa.findFirst({
          where: { clienteId: cliente.id, canal: 'whatsapp' },
        });

        const conversa =
          conversaExistente ??
          (await db.conversa.create({ data: { clienteId: cliente.id, canal: 'whatsapp' } }));

        await db.mensagem.create({
          data: {
            conversaId: conversa.id,
            direcao: 'recebida',
            autor: 'cliente',
            conteudo,
            idExterno: mensagem.id,
            enviadaEm,
          },
        });

        await db.conversa.update({
          where: { id: conversa.id },
          data: {
            ultimaMensagem: conteudo,
            ultimaMensagemEm: enviadaEm,
            naoLidas: { increment: 1 },
            // Mensagem nova reabre conversa resolvida: o cliente voltou.
            status: 'aberta',
          },
        });

        const emAberto = await db.atendimento.findFirst({
          where: {
            clienteId: cliente.id,
            etapa: { notIn: ['finalizado', 'perdido'] },
          },
          select: { id: true },
        });

        if (!emAberto) {
          await db.atendimento.create({
            data: {
              clienteId: cliente.id,
              // Origem e interesse ficam em branco: quem escreveu no WhatsApp
              // ainda não disse de onde veio nem o que quer. A atendente
              // preenche, e o card avisa que está pendente.
              origem: 'outro',
              canal: 'whatsapp',
              etapa: 'novo',
              dados: {},
            },
          });

          resultado.atendimentosNovos += 1;
        }

        resultado.processadas += 1;
      }
    }
  }

  return resultado;
};
