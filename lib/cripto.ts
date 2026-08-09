import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

// Token do WhatsApp e chave do Bling nao podem ficar em texto puro no banco:
// um backup vazado entregaria acesso as contas. AES-256-GCM tambem detecta
// adulteracao, entao valor mexido no banco falha ao decifrar em vez de passar.
const chave = () => {
  const segredo = process.env.AUTH_SECRET;

  if (!segredo) throw new Error('AUTH_SECRET não definido');

  return createHash('sha256').update(segredo).digest();
};

export const cifrar = (texto: string) => {
  if (!texto) return '';

  const iv = randomBytes(12);
  const cifra = createCipheriv('aes-256-gcm', chave(), iv);
  const dados = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()]);

  return [iv.toString('base64'), cifra.getAuthTag().toString('base64'), dados.toString('base64')].join('.');
};

export const decifrar = (guardado: string) => {
  if (!guardado) return '';

  const [iv, tag, dados] = guardado.split('.');

  if (!iv || !tag || !dados) return '';

  try {
    const decifra = createDecipheriv('aes-256-gcm', chave(), Buffer.from(iv, 'base64'));
    decifra.setAuthTag(Buffer.from(tag, 'base64'));

    return Buffer.concat([
      decifra.update(Buffer.from(dados, 'base64')),
      decifra.final(),
    ]).toString('utf8');
  } catch {
    return '';
  }
};

// Mostra so o final do segredo, o suficiente para conferir qual foi salvo sem
// devolver o valor inteiro para o navegador.
export const mascarar = (texto: string) => {
  if (!texto) return '';
  if (texto.length <= 6) return '••••••';

  return `••••••${texto.slice(-4)}`;
};
