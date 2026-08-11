import { db } from '../db';
import { decifrar } from '../cripto';

export type CredenciaisWhatsapp = {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  appSecret: string;
  verifyToken: string;
};

// As credenciais ficam cifradas no banco. Sao lidas a cada uso em vez de
// guardadas em memoria, para trocar o token pelo painel valer na hora.
export const credenciaisWhatsapp = async (): Promise<CredenciaisWhatsapp | undefined> => {
  const registro = await db.integracao.findUnique({ where: { id: 'whatsapp' } });

  if (!registro) return undefined;

  const guardadas = (registro.dados ?? {}) as Record<string, string>;

  const abertas = {
    phoneNumberId: decifrar(guardadas.phoneNumberId ?? ''),
    businessAccountId: decifrar(guardadas.businessAccountId ?? ''),
    accessToken: decifrar(guardadas.accessToken ?? ''),
    appSecret: decifrar(guardadas.appSecret ?? ''),
    verifyToken: decifrar(guardadas.verifyToken ?? ''),
  };

  if (!abertas.verifyToken || !abertas.accessToken) return undefined;

  return abertas;
};
