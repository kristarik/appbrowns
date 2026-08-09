import 'server-only';
import { db } from './db';
import type {
  Atendimento,
  Cliente,
  Conversa,
  DadosEtapa,
  Mensagem,
  Tarefa,
} from './tipos';

// Os componentes de tela sao de cliente, e o Next so consegue enviar dados
// serializaveis para eles. Date e Decimal do Prisma nao passam, entao viram
// string ISO e number aqui na fronteira.
const iso = (data: Date | null) => (data ? data.toISOString() : undefined);
const numero = (valor: unknown) => (valor === null || valor === undefined ? undefined : Number(valor));

export const listarAtendimentos = async (): Promise<Atendimento[]> => {
  const registros = await db.atendimento.findMany({
    include: { responsavel: { select: { nome: true } } },
    orderBy: { atualizadoEm: 'desc' },
  });

  return registros.map((r) => ({
    id: r.id,
    clienteId: r.clienteId,
    origem: r.origem,
    canal: r.canal,
    necessidade: r.necessidade,
    ocasiao: r.ocasiao ?? undefined,
    dataEvento: iso(r.dataEvento),
    interesseInicial: r.interesseInicial ?? undefined,
    etapa: r.etapa,
    valor: numero(r.valor),
    responsavel: r.responsavel?.nome,
    motivoPerda: r.motivoPerda ?? undefined,
    dados: (r.dados ?? {}) as DadosEtapa,
    atualizadoEm: r.atualizadoEm.toISOString(),
  }));
};

export const listarClientes = async (): Promise<Cliente[]> => {
  const registros = await db.cliente.findMany({ orderBy: { criadoEm: 'desc' } });

  return registros.map((r) => ({
    id: r.id,
    nome: r.nome,
    telefone: r.telefone,
    email: r.email ?? undefined,
    observacoes: r.observacoes ?? undefined,
    criadoEm: r.criadoEm.toISOString(),
  }));
};

export const listarConversas = async (): Promise<Conversa[]> => {
  const registros = await db.conversa.findMany({
    include: {
      cliente: { select: { nome: true } },
      responsavel: { select: { nome: true } },
    },
    orderBy: { ultimaMensagemEm: 'desc' },
  });

  return registros.map((r) => ({
    id: r.id,
    clienteId: r.clienteId,
    clienteNome: r.cliente.nome,
    canal: r.canal,
    status: r.status,
    naoLidas: r.naoLidas,
    ultimaMensagem: r.ultimaMensagem ?? undefined,
    ultimaMensagemEm: iso(r.ultimaMensagemEm),
    responsavel: r.responsavel?.nome,
  }));
};

export const listarMensagens = async (): Promise<Mensagem[]> => {
  const registros = await db.mensagem.findMany({
    include: { enviadaPor: { select: { nome: true } } },
    orderBy: { enviadaEm: 'asc' },
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

export const listarTarefas = async (): Promise<Tarefa[]> => {
  const registros = await db.tarefa.findMany({
    include: {
      responsavel: { select: { nome: true } },
      atendimento: { select: { cliente: { select: { nome: true } } } },
    },
    orderBy: { venceEm: 'asc' },
  });

  return registros.map((r) => ({
    id: r.id,
    atendimentoId: r.atendimentoId,
    titulo: r.titulo,
    etapaOrigem: r.etapaOrigem,
    venceEm: r.venceEm.toISOString(),
    concluida: r.concluida,
    responsavel: r.responsavel?.nome,
    cliente: r.atendimento.cliente.nome,
  }));
};
