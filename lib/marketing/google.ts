// Sem 'server-only' de proposito: este modulo tambem roda por linha de comando,
// no agendamento que atualiza as metricas. O uso de node:fs ja impede que ele
// va parar no navegador.
import { readFileSync } from 'node:fs';
import { JWT, OAuth2Client } from 'google-auth-library';

// GA4 e Search Console usam conta de servico: a chave ja tem acesso concedido,
// ninguem precisa clicar em nada. O Google Ads nao aceita conta de servico em
// conta comum, entao usa o refresh token que veio do projeto antigo.

const ESCOPOS = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

let contaDeServico: JWT | undefined;

export const tokenDeServico = async () => {
  if (!contaDeServico) {
    const caminho = process.env.GOOGLE_SA_KEY_PATH;

    if (!caminho) throw new Error('GOOGLE_SA_KEY_PATH não definido');

    const chave = JSON.parse(readFileSync(caminho, 'utf8')) as {
      client_email: string;
      private_key: string;
    };

    contaDeServico = new JWT({
      email: chave.client_email,
      key: chave.private_key,
      scopes: ESCOPOS,
    });
  }

  const { token } = await contaDeServico.getAccessToken();

  if (!token) throw new Error('Não foi possível obter token da conta de serviço');

  return token;
};

export const tokenDoAds = async () => {
  const { GADS_CLIENT_ID, GADS_CLIENT_SECRET, GADS_REFRESH_TOKEN } = process.env;

  if (!GADS_CLIENT_ID || !GADS_CLIENT_SECRET || !GADS_REFRESH_TOKEN) {
    throw new Error('Credenciais do Google Ads incompletas');
  }

  const cliente = new OAuth2Client(GADS_CLIENT_ID, GADS_CLIENT_SECRET);
  cliente.setCredentials({ refresh_token: GADS_REFRESH_TOKEN });

  const { token } = await cliente.getAccessToken();

  if (!token) throw new Error('Não foi possível renovar o token do Google Ads');

  return token;
};

export const emDia = (data: Date) => data.toISOString().slice(0, 10);

export const diasAtras = (dias: number) => {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
};

// Uma data vinda do Google (20260810) ou (2026-08-10) vira Date em UTC, para o
// dia nao escorregar por causa do fuso do servidor.
export const paraData = (texto: string) => {
  const limpo = texto.replace(/-/g, '');
  const iso = `${limpo.slice(0, 4)}-${limpo.slice(4, 6)}-${limpo.slice(6, 8)}`;
  return new Date(`${iso}T00:00:00.000Z`);
};
