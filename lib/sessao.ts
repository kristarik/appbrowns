import 'server-only';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import type { Papel } from './tipos';

const COOKIE = 'browns_sessao';
const DURACAO_HORAS = 12;

export type Sessao = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

const segredo = () => {
  const valor = process.env.AUTH_SECRET;

  // Falhar alto aqui e proposital: sem segredo o token seria assinado com algo
  // previsivel e qualquer um poderia forjar uma sessao de admin.
  if (!valor) throw new Error('AUTH_SECRET não definido');

  return new TextEncoder().encode(valor);
};

export const criarSessao = async (usuario: Sessao) => {
  const token = await new SignJWT({ ...usuario })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_HORAS}h`)
    .sign(segredo());

  const jar = await cookies();

  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACAO_HORAS * 3600,
  });
};

export const lerSessao = async (): Promise<Sessao | undefined> => {
  const token = (await cookies()).get(COOKIE)?.value;

  if (!token) return undefined;

  try {
    const { payload } = await jwtVerify(token, segredo());

    return {
      id: String(payload.id),
      nome: String(payload.nome),
      email: String(payload.email),
      papel: payload.papel as Papel,
    };
  } catch {
    return undefined;
  }
};

export const encerrarSessao = async () => {
  (await cookies()).delete(COOKIE);
};

export const NOME_COOKIE = COOKIE;
