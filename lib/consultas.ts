import 'server-only';
import { db } from './db';
import { camposPendentes } from './funil';
import { decifrar, mascarar } from './cripto';
import { diasAte } from './utils';
import type {
  Atendimento,
  Cliente,
  Conversa,
  DadosEtapa,
  Mensagem,
  Papel,
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
    necessidade: r.necessidade ?? undefined,
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

export type ConfiguracaoGeral = {
  nomeLoja: string;
  corMarca: string;
  corSuave: string;
  logoUrl?: string;
};

export const buscarConfiguracao = async (): Promise<ConfiguracaoGeral> => {
  // upsert em vez de findUnique para a primeira abertura do painel nao precisar
  // de um seed so para criar esta linha.
  const registro = await db.configuracao.upsert({
    where: { id: 'unica' },
    update: {},
    create: { id: 'unica' },
  });

  return {
    nomeLoja: registro.nomeLoja,
    corMarca: registro.corMarca,
    corSuave: registro.corSuave,
    logoUrl: registro.logoUrl ?? undefined,
  };
};

export type UsuarioDaEquipe = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  criadoEm: string;
};

export const listarUsuarios = async (): Promise<UsuarioDaEquipe[]> => {
  const registros = await db.usuario.findMany({ orderBy: { criadoEm: 'asc' } });

  return registros.map((r) => ({
    id: r.id,
    nome: r.nome,
    email: r.email,
    papel: r.papel,
    ativo: r.ativo,
    criadoEm: r.criadoEm.toISOString(),
  }));
};

export type IntegracaoResumo = {
  id: string;
  ativa: boolean;
  // Valores ja mascarados: o segredo em si nunca chega ao navegador.
  campos: Record<string, string>;
};

export const listarIntegracoes = async (): Promise<IntegracaoResumo[]> => {
  const registros = await db.integracao.findMany();

  return registros.map((r) => {
    const guardados = (r.dados ?? {}) as Record<string, string>;
    const campos: Record<string, string> = {};

    for (const [chave, valor] of Object.entries(guardados)) {
      campos[chave] = mascarar(decifrar(valor));
    }

    return { id: r.id, ativa: r.ativa, campos };
  });
};

// O token de sessao vale 12 horas e carrega os dados do usuario dentro dele.
// Sem conferir no banco a cada carregamento, apagar ou desativar alguem nao
// tiraria a pessoa do sistema ate o token expirar sozinho.
export const usuarioAtivo = async (id: string) => {
  const usuario = await db.usuario.findUnique({
    where: { id },
    select: { ativo: true },
  });

  return usuario?.ativo === true;
};

export type Contagens = {
  conversas: {
    todas: number;
    minhas: number;
    naoAtribuidas: number;
    resolvidas: number;
    porCanal: Record<string, number>;
    porResponsavel: { nome: string; total: number }[];
  };
  atendimentos: {
    todos: number;
    meus: number;
    urgentes: number;
    pendencias: number;
    porNecessidade: Record<string, number>;
    porOrigem: Record<string, number>;
  };
  tarefas: { todas: number; atrasadas: number; hoje: number; concluidas: number };
  clientes: { todos: number; ativos: number; recentes: number };
};

const contar = <T>(itens: T[], chave: (item: T) => string | undefined) => {
  const mapa: Record<string, number> = {};

  for (const item of itens) {
    const valor = chave(item);
    if (valor) mapa[valor] = (mapa[valor] ?? 0) + 1;
  }

  return mapa;
};

// Alimenta os numeros da barra lateral. Antes eram fixos no codigo, herdados
// dos dados simulados, e em producao mostravam conversas que nao existiam.
export const contarNavegacao = async (usuario: string): Promise<Contagens> => {
  const [conversas, atendimentos, tarefas, clientes] = await Promise.all([
    listarConversas(),
    listarAtendimentos(),
    listarTarefas(),
    listarClientes(),
  ]);

  const agora = new Date();
  const fimDoDia = new Date(agora);
  fimDoDia.setHours(23, 59, 59, 999);

  const inicioDoMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const abertos = atendimentos.filter(
    (a) => a.etapa !== 'finalizado' && a.etapa !== 'perdido',
  );

  const responsaveis = contar(conversas, (c) => c.responsavel);

  return {
    conversas: {
      todas: conversas.length,
      minhas: conversas.filter((c) => c.responsavel === usuario).length,
      naoAtribuidas: conversas.filter((c) => !c.responsavel).length,
      resolvidas: conversas.filter((c) => c.status === 'resolvida').length,
      porCanal: contar(conversas, (c) => c.canal),
      porResponsavel: Object.entries(responsaveis)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total),
    },
    atendimentos: {
      todos: atendimentos.length,
      meus: atendimentos.filter((a) => a.responsavel === usuario).length,
      urgentes: abertos.filter((a) => {
        if (!a.dataEvento) return false;
        const dias = diasAte(a.dataEvento);
        return dias >= 0 && dias <= 7;
      }).length,
      pendencias: abertos.filter(
        (a) => camposPendentes(a.etapa, a.dados).length > 0,
      ).length,
      porNecessidade: contar(atendimentos, (a) => a.necessidade),
      porOrigem: contar(atendimentos, (a) => a.origem),
    },
    tarefas: {
      todas: tarefas.filter((t) => !t.concluida).length,
      atrasadas: tarefas.filter((t) => !t.concluida && new Date(t.venceEm) < agora).length,
      hoje: tarefas.filter(
        (t) => !t.concluida && new Date(t.venceEm) <= fimDoDia && new Date(t.venceEm) >= agora,
      ).length,
      concluidas: tarefas.filter((t) => t.concluida).length,
    },
    clientes: {
      todos: clientes.length,
      ativos: new Set(abertos.map((a) => a.clienteId)).size,
      recentes: clientes.filter((c) => new Date(c.criadoEm) >= inicioDoMes).length,
    },
  };
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
