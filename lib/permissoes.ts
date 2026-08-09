import type { Papel } from './tipos';

export const PAPEIS: Record<Papel, { nome: string; descricao: string }> = {
  admin: {
    nome: 'Administrador',
    descricao:
      'Tudo do gerente, mais integrações e dados da loja. Só o administrador cria outro administrador.',
  },
  gerente: {
    nome: 'Gerente',
    descricao:
      'Tudo do atendente, mais relatórios e gestão da equipe: criar, editar e excluir membros.',
  },
  atendente: {
    nome: 'Atendente',
    descricao:
      'Conversas, funil, clientes e follow-ups. Troca a própria senha. Não vê relatórios.',
  },
};

export const verRelatorios = (papel: Papel) => papel === 'admin' || papel === 'gerente';

export const gerenciarEquipe = (papel: Papel) => papel === 'admin' || papel === 'gerente';

// Integracoes e dados da loja mexem com credenciais e identidade do negocio,
// entao ficam so com o administrador.
export const gerenciarSistema = (papel: Papel) => papel === 'admin';

// Um gerente nao pode criar nem alterar administrador. Sem essa regra, bastaria
// promover a si mesmo pela tela de equipe para virar administrador, e a
// separacao entre os dois papeis deixaria de existir.
export const papeisQuePodeConceder = (papel: Papel): Papel[] =>
  papel === 'admin' ? ['admin', 'gerente', 'atendente'] : ['gerente', 'atendente'];

export const podeMexerEm = (ator: Papel, alvo: Papel) => {
  if (!gerenciarEquipe(ator)) return false;
  if (ator === 'admin') return true;

  return alvo !== 'admin';
};
