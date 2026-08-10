import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { sincronizarTudo } from '@/lib/marketing/sincronizar';

// Chamada pelo agendamento do servidor, sem sessão de usuário. A proteção é uma
// chave própria: quem não tiver, não passa.
const chaveConfere = (recebida: string | null) => {
  const esperada = process.env.CRON_SECRET;

  if (!esperada || !recebida) return false;

  const a = Buffer.from(recebida);
  const b = Buffer.from(`Bearer ${esperada}`);

  // Comprimentos diferentes já reprovam, e a comparação de tempo constante
  // evita que o tempo de resposta entregue quantos caracteres estavam certos.
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
};

export const POST = async (request: NextRequest) => {
  if (!chaveConfere(request.headers.get('authorization'))) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
  }

  const dias = Number(request.nextUrl.searchParams.get('dias') ?? 30);
  const resultados = await sincronizarTudo(Number.isFinite(dias) ? dias : 30);
  const comErro = resultados.some((r) => !r.ok);

  return NextResponse.json({ resultados }, { status: comErro ? 207 : 200 });
};
