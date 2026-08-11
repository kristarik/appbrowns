import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { credenciaisWhatsapp } from '@/lib/whatsapp/credenciais';
import { receberEvento, type EventoWhatsapp } from '@/lib/whatsapp/receber';

// A Meta chama este endereço para confirmar que ele é nosso, devolvendo o
// desafio quando o verify token bate.
export const GET = async (request: NextRequest) => {
  const parametros = request.nextUrl.searchParams;
  const credenciais = await credenciaisWhatsapp();

  if (!credenciais) {
    return new NextResponse('Integração não configurada', { status: 503 });
  }

  const modo = parametros.get('hub.mode');
  const token = parametros.get('hub.verify_token');
  const desafio = parametros.get('hub.challenge');

  if (modo === 'subscribe' && token === credenciais.verifyToken && desafio) {
    return new NextResponse(desafio, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Token inválido', { status: 403 });
};

// A assinatura prova que o corpo veio da Meta e não de alguém que descobriu a
// URL. Sem esta conferência, qualquer um poderia inventar clientes no painel.
const assinaturaConfere = (corpo: string, cabecalho: string | null, segredo: string) => {
  if (!cabecalho?.startsWith('sha256=') || !segredo) return false;

  const esperada = `sha256=${createHmac('sha256', segredo).update(corpo).digest('hex')}`;

  const a = Buffer.from(cabecalho);
  const b = Buffer.from(esperada);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
};

export const POST = async (request: NextRequest) => {
  const credenciais = await credenciaisWhatsapp();

  if (!credenciais) {
    return new NextResponse('Integração não configurada', { status: 503 });
  }

  const corpo = await request.text();

  if (!assinaturaConfere(corpo, request.headers.get('x-hub-signature-256'), credenciais.appSecret)) {
    return new NextResponse('Assinatura inválida', { status: 401 });
  }

  let evento: EventoWhatsapp;

  try {
    evento = JSON.parse(corpo) as EventoWhatsapp;
  } catch {
    return new NextResponse('Corpo inválido', { status: 400 });
  }

  try {
    const resultado = await receberEvento(evento);

    if (resultado.processadas > 0) {
      revalidatePath('/chat');
      revalidatePath('/kanban');
    }

    return NextResponse.json(resultado);
  } catch (erro) {
    console.error('Falha ao processar mensagem do WhatsApp', erro);

    // Devolver erro faz a Meta reenviar o evento depois, então a mensagem não
    // se perde por uma falha momentânea do banco.
    return new NextResponse('Falha ao processar', { status: 500 });
  }
};
