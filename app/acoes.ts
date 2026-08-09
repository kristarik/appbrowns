'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { criarSessao, encerrarSessao, lerSessao } from '@/lib/sessao';
import type { Etapa } from '@/lib/tipos';

const ETAPAS_VALIDAS = [
  'novo',
  'atendimento_inicial',
  'agendado',
  'decidindo',
  'aguardando_retirada',
  'em_provas',
  'em_locacao',
  'finalizado',
  'perdido',
] as const;

const entradaLogin = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
});

export type EstadoLogin = { erro?: string };

export const entrar = async (
  _anterior: EstadoLogin,
  formulario: FormData,
): Promise<EstadoLogin> => {
  const dados = entradaLogin.safeParse({
    email: formulario.get('email'),
    senha: formulario.get('senha'),
  });

  if (!dados.success) {
    return { erro: dados.error.issues[0].message };
  }

  const usuario = await db.usuario.findUnique({
    where: { email: dados.data.email.toLowerCase().trim() },
  });

  // Mesma mensagem para email inexistente e senha errada, de proposito: dizer
  // qual dos dois falhou entrega para um atacante quais emails existem.
  const generico = { erro: 'E-mail ou senha incorretos' };

  if (!usuario || !usuario.ativo) return generico;

  const confere = await compare(dados.data.senha, usuario.senhaHash);

  if (!confere) return generico;

  await criarSessao({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  });

  redirect('/chat');
};

export const sair = async () => {
  await encerrarSessao();
  redirect('/login');
};

export const moverAtendimento = async (id: string, destino: Etapa) => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' };

  if (!ETAPAS_VALIDAS.includes(destino)) return { erro: 'Etapa inválida' };

  await db.atendimento.update({ where: { id }, data: { etapa: destino } });

  revalidatePath('/kanban');
  revalidatePath('/clientes');

  return {};
};

export const alternarTarefa = async (id: string, concluida: boolean) => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' };

  await db.tarefa.update({
    where: { id },
    data: { concluida, concluidaEm: concluida ? new Date() : null },
  });

  revalidatePath('/tarefas');

  return {};
};

export const enviarMensagem = async (conversaId: string, conteudo: string) => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' };

  const texto = conteudo.trim();

  if (!texto) return { erro: 'Mensagem vazia' };

  await db.$transaction([
    db.mensagem.create({
      data: {
        conversaId,
        direcao: 'enviada',
        autor: 'atendente',
        conteudo: texto,
        enviadaPorId: sessao.id,
      },
    }),
    db.conversa.update({
      where: { id: conversaId },
      data: { ultimaMensagem: texto, ultimaMensagemEm: new Date(), naoLidas: 0 },
    }),
  ]);

  revalidatePath('/chat');
  revalidatePath('/kanban');

  return {};
};

// Buscadas sob demanda em vez de virem todas junto com a pagina: o historico de
// uma loja com anos de WhatsApp seria grande demais para mandar inteiro ao
// navegador a cada carregamento.
export const buscarMensagens = async (conversaId: string) => {
  const sessao = await lerSessao();

  if (!sessao) return [];

  const registros = await db.mensagem.findMany({
    where: { conversaId },
    include: { enviadaPor: { select: { nome: true } } },
    orderBy: { enviadaEm: 'asc' },
    take: 200,
  });

  return registros.map((r) => ({
    id: r.id,
    conversaId: r.conversaId,
    direcao: r.direcao,
    autor: r.autor,
    conteudo: r.conteudo,
    enviadaPor: r.enviadaPor?.nome,
    enviadaEm: r.enviadaEm.toISOString(),
  }));
};

export const resolverConversa = async (id: string) => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' };

  await db.conversa.update({ where: { id }, data: { status: 'resolvida', naoLidas: 0 } });

  revalidatePath('/chat');

  return {};
};
