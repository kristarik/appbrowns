'use server';

import { revalidatePath } from 'next/cache';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { cifrar, decifrar } from '@/lib/cripto';
import { CAMPOS_INTEGRACAO } from '@/lib/integracoes';
import {
  gerenciarEquipe,
  gerenciarSistema,
  papeisQuePodeConceder,
  podeMexerEm,
} from '@/lib/permissoes';
import type { Papel } from '@/lib/tipos';
import { criarSessao, lerSessao } from '@/lib/sessao';

export type Resultado = { erro?: string; ok?: string };

const exigirAdmin = async () => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' } as const;
  if (!gerenciarSistema(sessao.papel)) {
    return { erro: 'Só administradores podem fazer isso' } as const;
  }

  return { sessao } as const;
};

const exigirGestaoDeEquipe = async () => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' } as const;
  if (!gerenciarEquipe(sessao.papel)) {
    return { erro: 'Só gerentes e administradores podem fazer isso' } as const;
  }

  return { sessao } as const;
};

// Sobra pelo menos um administrador ativo depois da mudanca? Sem isso, o painel
// pode ficar sem ninguem capaz de mexer em integracoes e dados da loja.
const restariaSemAdmin = async (idAlvo: string) => {
  const alvo = await db.usuario.findUnique({
    where: { id: idAlvo },
    select: { papel: true, ativo: true },
  });

  if (alvo?.papel !== 'admin' || !alvo.ativo) return false;

  const admins = await db.usuario.count({ where: { papel: 'admin', ativo: true } });

  return admins <= 1;
};

// ———————————————————————— Geral ————————————————————————

const entradaGeral = z.object({
  nomeLoja: z.string().trim().min(1, 'Informe o nome da loja').max(60),
  corMarca: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'A cor precisa estar no formato #1b6df0'),
  logoUrl: z.string().trim().url('URL inválida').or(z.literal('')),
});

export const salvarGeral = async (
  _anterior: Resultado,
  formulario: FormData,
): Promise<Resultado> => {
  const permissao = await exigirAdmin();

  if ('erro' in permissao) return permissao;

  const dados = entradaGeral.safeParse({
    nomeLoja: formulario.get('nomeLoja'),
    corMarca: formulario.get('corMarca'),
    logoUrl: formulario.get('logoUrl') ?? '',
  });

  if (!dados.success) return { erro: dados.error.issues[0].message };

  await db.configuracao.upsert({
    where: { id: 'unica' },
    update: {
      nomeLoja: dados.data.nomeLoja,
      corMarca: dados.data.corMarca,
      logoUrl: dados.data.logoUrl || null,
    },
    create: {
      id: 'unica',
      nomeLoja: dados.data.nomeLoja,
      corMarca: dados.data.corMarca,
      logoUrl: dados.data.logoUrl || null,
    },
  });

  revalidatePath('/', 'layout');

  return { ok: 'Configurações salvas' };
};

// ———————————————————————— Minha senha ————————————————————————

const entradaSenha = z
  .object({
    atual: z.string().min(1, 'Informe a senha atual'),
    nova: z.string().min(8, 'A nova senha precisa ter pelo menos 8 caracteres'),
    confirmacao: z.string(),
  })
  .refine((d) => d.nova === d.confirmacao, {
    message: 'A confirmação não confere com a nova senha',
  });

export const trocarMinhaSenha = async (
  _anterior: Resultado,
  formulario: FormData,
): Promise<Resultado> => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' };

  const dados = entradaSenha.safeParse({
    atual: formulario.get('atual'),
    nova: formulario.get('nova'),
    confirmacao: formulario.get('confirmacao'),
  });

  if (!dados.success) return { erro: dados.error.issues[0].message };

  const usuario = await db.usuario.findUnique({ where: { id: sessao.id } });

  if (!usuario) return { erro: 'Usuário não encontrado' };

  // Exigir a senha atual impede que alguem com o computador destravado troque a
  // senha e tome a conta.
  if (!(await compare(dados.data.atual, usuario.senhaHash))) {
    return { erro: 'A senha atual está incorreta' };
  }

  await db.usuario.update({
    where: { id: sessao.id },
    data: { senhaHash: await hash(dados.data.nova, 10) },
  });

  return { ok: 'Senha alterada' };
};

// ———————————————————————— Equipe ————————————————————————

const entradaUsuario = z.object({
  nome: z.string().trim().min(2, 'Informe o nome'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
  papel: z.enum(['admin', 'gerente', 'atendente']),
});

export const criarUsuario = async (
  _anterior: Resultado,
  formulario: FormData,
): Promise<Resultado> => {
  const permissao = await exigirGestaoDeEquipe();

  if ('erro' in permissao) return permissao;

  const dados = entradaUsuario.safeParse({
    nome: formulario.get('nome'),
    email: formulario.get('email'),
    senha: formulario.get('senha'),
    papel: formulario.get('papel'),
  });

  if (!dados.success) return { erro: dados.error.issues[0].message };

  if (!papeisQuePodeConceder(permissao.sessao.papel).includes(dados.data.papel)) {
    return { erro: 'Você não pode criar alguém com esse papel' };
  }

  const existente = await db.usuario.findUnique({ where: { email: dados.data.email } });

  if (existente) return { erro: 'Já existe alguém com esse e-mail' };

  await db.usuario.create({
    data: {
      nome: dados.data.nome,
      email: dados.data.email,
      senhaHash: await hash(dados.data.senha, 10),
      papel: dados.data.papel,
    },
  });

  revalidatePath('/configuracoes/equipe');

  return { ok: `${dados.data.nome} adicionado` };
};

// Confere se o ator pode mexer neste alvo especifico. Um gerente nao alcanca
// administrador, e ninguem mexe em si mesmo pela tela de equipe.
const validarAlvo = async (ator: { id: string; papel: Papel }, id: string) => {
  if (id === ator.id) return 'Você não pode alterar a si mesmo por aqui';

  const alvo = await db.usuario.findUnique({ where: { id }, select: { papel: true } });

  if (!alvo) return 'Usuário não encontrado';
  if (!podeMexerEm(ator.papel, alvo.papel)) {
    return 'Você não tem permissão sobre um administrador';
  }

  return undefined;
};

export const alternarAtivo = async (id: string, ativo: boolean): Promise<Resultado> => {
  const permissao = await exigirGestaoDeEquipe();

  if ('erro' in permissao) return permissao;

  const impedimento = await validarAlvo(permissao.sessao, id);

  if (impedimento) return { erro: impedimento };

  if (!ativo && (await restariaSemAdmin(id))) {
    return { erro: 'Este é o último administrador ativo' };
  }

  await db.usuario.update({ where: { id }, data: { ativo } });

  revalidatePath('/configuracoes/equipe');

  return { ok: ativo ? 'Usuário reativado' : 'Usuário desativado' };
};

export const mudarPapel = async (id: string, papel: Papel): Promise<Resultado> => {
  const permissao = await exigirGestaoDeEquipe();

  if ('erro' in permissao) return permissao;

  const impedimento = await validarAlvo(permissao.sessao, id);

  if (impedimento) return { erro: impedimento };

  if (!papeisQuePodeConceder(permissao.sessao.papel).includes(papel)) {
    return { erro: 'Você não pode conceder esse papel' };
  }

  if (papel !== 'admin' && (await restariaSemAdmin(id))) {
    return { erro: 'Este é o último administrador ativo' };
  }

  await db.usuario.update({ where: { id }, data: { papel } });

  revalidatePath('/configuracoes/equipe');

  return { ok: 'Papel atualizado' };
};

export const excluirUsuario = async (id: string): Promise<Resultado> => {
  const permissao = await exigirGestaoDeEquipe();

  if ('erro' in permissao) return permissao;

  const impedimento = await validarAlvo(permissao.sessao, id);

  if (impedimento) return { erro: impedimento };

  if (await restariaSemAdmin(id)) {
    return { erro: 'Este é o último administrador ativo' };
  }

  // Atendimentos, tarefas e mensagens ficam no lugar: o schema desliga a
  // relacao em vez de apagar em cascata. O historico da loja nao pode sumir
  // porque alguem saiu da equipe.
  const removido = await db.usuario.delete({ where: { id }, select: { nome: true } });

  revalidatePath('/configuracoes/equipe');

  return { ok: `${removido.nome} foi excluído. O histórico dele continua no sistema.` };
};

export const renomearMeuPerfil = async (
  _anterior: Resultado,
  formulario: FormData,
): Promise<Resultado> => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' };

  const nome = String(formulario.get('nome') ?? '').trim();

  if (nome.length < 2) return { erro: 'Informe seu nome' };

  const usuario = await db.usuario.update({
    where: { id: sessao.id },
    data: { nome },
  });

  // A sessao carrega o nome dentro do token, entao precisa ser reemitida para o
  // painel parar de mostrar o nome antigo.
  await criarSessao({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  });

  revalidatePath('/', 'layout');

  return { ok: 'Nome atualizado' };
};

// ———————————————————————— Integrações ————————————————————————

export const salvarIntegracao = async (
  _anterior: Resultado,
  formulario: FormData,
): Promise<Resultado> => {
  const permissao = await exigirAdmin();

  if ('erro' in permissao) return permissao;

  const id = String(formulario.get('integracao') ?? '');
  const definicao = CAMPOS_INTEGRACAO[id];

  if (!definicao) return { erro: 'Integração desconhecida' };

  const atual = await db.integracao.findUnique({ where: { id } });
  const guardados = (atual?.dados ?? {}) as Record<string, string>;
  const novos: Record<string, string> = { ...guardados };

  for (const campo of definicao) {
    const valor = String(formulario.get(campo.id) ?? '').trim();

    // Campo em branco mantem o que ja estava salvo. O formulario nunca recebe o
    // segredo de volta, entao exigir redigitar tudo para trocar um campo so
    // seria um convite a apagar credencial sem querer.
    if (valor) novos[campo.id] = cifrar(valor);
  }

  const completa = definicao.every((c) => Boolean(novos[c.id]));

  await db.integracao.upsert({
    where: { id },
    update: { dados: novos, ativa: completa },
    create: { id, dados: novos, ativa: completa },
  });

  revalidatePath('/configuracoes/integracoes');

  return {
    ok: completa
      ? 'Credenciais salvas. A integração ainda não está conectada, isso entra na próxima versão.'
      : 'Salvo. Faltam campos para a integração ficar completa.',
  };
};

export const limparIntegracao = async (id: string): Promise<Resultado> => {
  const permissao = await exigirAdmin();

  if ('erro' in permissao) return permissao;

  await db.integracao.deleteMany({ where: { id } });

  revalidatePath('/configuracoes/integracoes');

  return { ok: 'Credenciais removidas' };
};

export const testarIntegracao = async (id: string): Promise<Resultado> => {
  const permissao = await exigirAdmin();

  if ('erro' in permissao) return permissao;

  const registro = await db.integracao.findUnique({ where: { id } });

  if (!registro) return { erro: 'Nenhuma credencial salva' };

  const guardados = registro.dados as Record<string, string>;
  const faltando = (CAMPOS_INTEGRACAO[id] ?? []).filter(
    (campo) => !decifrar(guardados[campo.id] ?? ''),
  );

  if (faltando.length > 0) {
    return { erro: `Faltam: ${faltando.map((c) => c.rotulo).join(', ')}` };
  }

  return {
    ok: 'Todos os campos estão preenchidos e as credenciais decifram corretamente. A conexão com o serviço será testada quando a integração for construída.',
  };
};
